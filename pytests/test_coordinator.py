import asyncio
from datetime import timedelta
from typing import Any, Callable, Dict, List


class FakeApiClient:
    def __init__(self, devices: List[Any], states: Dict[str, Dict[str, Any]]):
        self._devices = devices
        self._states = states
        self.list_calls: int = 0
        self.state_calls: List[str] = []

    async def async_list_devices(self) -> List[Any]:
        self.list_calls += 1
        return self._devices

    async def async_get_device_state(self, device_id: str) -> Dict[str, Any]:
        self.state_calls.append(device_id)
        return self._states.get(device_id, {})


class FakeDeviceRegistry:
    def __init__(self):
        self.created: List[Dict[str, Any]] = []

    async def async_get_or_create(self, **data: Any) -> Dict[str, Any]:
        self.created.append(data)
        return {"id": f"device-{len(self.created)}", **data}


class FakeEntityRegistry:
    def __init__(self):
        self.registered: List[Dict[str, Any]] = []

    async def async_get_or_create(self, **data: Any) -> Dict[str, Any]:
        self.registered.append(data)
        return {"entity_id": data.get("entity_id", f"entity.{len(self.registered)}"), **data}


class FakeChannel:
    def __init__(self, name: str):
        self.name = name
        self.listeners: List[Callable[[str, Dict[str, Any]], None]] = []
        self.commands: List[Dict[str, Any]] = []

    def subscribe(self, callback: Callable[[str, Dict[str, Any]], None]) -> None:
        self.listeners.append(callback)

    async def async_send_command(self, device_id: str, payload: Dict[str, Any]) -> None:
        self.commands.append({"device_id": device_id, "payload": payload, "channel": self.name})

    def emit(self, device_id: str, payload: Dict[str, Any]) -> None:
        for listener in list(self.listeners):
            listener(self.name, {"device_id": device_id, **payload})


class FakeHass:
    def __init__(self):
        self.data: Dict[str, Any] = {}


def test_coordinator_discovers_devices_and_registers_entities() -> None:
    async def run() -> None:
        from custom_components.ultimate_govee.coordinator import (
            DeviceMetadata,
            EntityMetadata,
            UltimateGoveeCoordinator,
        )

        api = FakeApiClient(
            [
                DeviceMetadata(
                    device_id="dev-1",
                    name="Office Light",
                    model="H6001",
                    manufacturer="Govee",
                    hw_version="1.0",
                    sw_version="2.0",
                    channels={"iot": {"topic": "light/dev-1"}},
                    entities=[
                        EntityMetadata(
                            entity_id="light.office",
                            unique_id="dev-1-light",
                            platform="light",
                            translation_key="office_light",
                        )
                    ],
                ),
                DeviceMetadata(
                    device_id="dev-2",
                    name="Desk Fan",
                    model="H7101",
                    manufacturer="Govee",
                    hw_version="1.1",
                    sw_version="2.1",
                    channels={"ble": {"mac": "AA:BB:CC:DD:EE:FF"}},
                    entities=[
                        EntityMetadata(
                            entity_id="fan.desk",
                            unique_id="dev-2-fan",
                            platform="fan",
                            translation_key="desk_fan",
                        )
                    ],
                ),
            ],
            states={"dev-1": {"on": False}, "dev-2": {"speed": "medium"}},
        )
        device_registry = FakeDeviceRegistry()
        entity_registry = FakeEntityRegistry()
        channels = {"iot": FakeChannel("iot"), "ble": FakeChannel("ble")}

        scheduled: List[Dict[str, Any]] = []

        def schedule_refresh(
            interval: timedelta, callback: Callable[[], Any]
        ) -> Callable[[], None]:
            scheduled.append({"interval": interval, "callback": callback})

            def cancel() -> None:
                scheduled.append({"cancelled": True})

            return cancel

        coordinator = UltimateGoveeCoordinator(
            hass=FakeHass(),
            config_entry_id="config-1",
            api_client=api,
            channels=channels,
            device_registry=device_registry,
            entity_registry=entity_registry,
            update_interval=timedelta(seconds=30),
            schedule_refresh=schedule_refresh,
        )

        await coordinator.async_initialize()

        assert set(coordinator.devices.keys()) == {"dev-1", "dev-2"}
        assert api.list_calls == 1
        assert device_registry.created[0]["identifiers"] == {("ultimate_govee", "dev-1")}
        assert entity_registry.registered[0]["unique_id"] == "dev-1-light"

        channels["iot"].emit("dev-1", {"state": {"on": True}})
        await asyncio.sleep(0)

        assert coordinator.devices["dev-1"].state["on"] is True

        await coordinator.async_stop()
        assert scheduled[-1].get("cancelled") is True

    asyncio.run(run())


def test_commands_route_to_expected_transport() -> None:
    async def run() -> None:
        from custom_components.ultimate_govee.coordinator import (
            CommandRequest,
            DeviceMetadata,
            EntityMetadata,
            UltimateGoveeCoordinator,
        )

        metadata = [
            DeviceMetadata(
                device_id="dev-1",
                name="Office Light",
                model="H6001",
                manufacturer="Govee",
                hw_version="1.0",
                sw_version="2.0",
                channels={"iot": {}},
                entities=[
                    EntityMetadata(
                        entity_id="light.office",
                        unique_id="dev-1-light",
                        platform="light",
                        translation_key="office_light",
                    )
                ],
            )
        ]
        api = FakeApiClient(metadata, states={})
        device_registry = FakeDeviceRegistry()
        entity_registry = FakeEntityRegistry()
        channels = {"iot": FakeChannel("iot"), "ble": FakeChannel("ble")}

        coordinator = UltimateGoveeCoordinator(
            hass=FakeHass(),
            config_entry_id="config-1",
            api_client=api,
            channels=channels,
            device_registry=device_registry,
            entity_registry=entity_registry,
            update_interval=timedelta(seconds=15),
        )

        await coordinator.async_initialize()

        await coordinator.async_execute_command(
            "dev-1", CommandRequest(transport="iot", payload={"cmd": "turn_on"})
        )

        assert channels["iot"].commands == [
            {"device_id": "dev-1", "payload": {"cmd": "turn_on"}, "channel": "iot"}
        ]

    asyncio.run(run())


def test_refresh_scheduling_calls_refresh_for_all_devices() -> None:
    async def run() -> None:
        from custom_components.ultimate_govee.coordinator import (
            DeviceMetadata,
            EntityMetadata,
            UltimateGoveeCoordinator,
        )

        metadata = [
            DeviceMetadata(
                device_id="dev-1",
                name="Office Light",
                model="H6001",
                manufacturer="Govee",
                hw_version="1.0",
                sw_version="2.0",
                channels={"iot": {}},
                entities=[
                    EntityMetadata(
                        entity_id="light.office",
                        unique_id="dev-1-light",
                        platform="light",
                        translation_key="office_light",
                    )
                ],
            ),
            DeviceMetadata(
                device_id="dev-2",
                name="Desk Fan",
                model="H7101",
                manufacturer="Govee",
                hw_version="1.1",
                sw_version="2.1",
                channels={"ble": {}},
                entities=[
                    EntityMetadata(
                        entity_id="fan.desk",
                        unique_id="dev-2-fan",
                        platform="fan",
                        translation_key="desk_fan",
                    )
                ],
            ),
        ]
        api = FakeApiClient(
            metadata, states={"dev-1": {"on": True}, "dev-2": {"speed": "high"}}
        )
        device_registry = FakeDeviceRegistry()
        entity_registry = FakeEntityRegistry()
        channels = {"iot": FakeChannel("iot"), "ble": FakeChannel("ble")}

        cancel_calls: List[None] = []
        captured_interval: List[timedelta] = []
        refresh_callbacks: List[Callable[[], Any]] = []

        def schedule_refresh(
            interval: timedelta, callback: Callable[[], Any]
        ) -> Callable[[], None]:
            captured_interval.append(interval)
            refresh_callbacks.append(callback)

            def cancel() -> None:
                cancel_calls.append(None)

            return cancel

        coordinator = UltimateGoveeCoordinator(
            hass=FakeHass(),
            config_entry_id="config-1",
            api_client=api,
            channels=channels,
            device_registry=device_registry,
            entity_registry=entity_registry,
            update_interval=timedelta(seconds=45),
            schedule_refresh=schedule_refresh,
        )

        await coordinator.async_initialize()
        await coordinator.async_start()

        assert captured_interval == [timedelta(seconds=45)]

        await refresh_callbacks[0]()

        assert sorted(api.state_calls) == ["dev-1", "dev-2"]
        assert coordinator.devices["dev-2"].state["speed"] == "high"

        await coordinator.async_stop()
        assert cancel_calls, "Stop should cancel the scheduled refresh"

    asyncio.run(run())
