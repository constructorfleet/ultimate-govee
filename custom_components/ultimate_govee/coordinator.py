"""Coordinator layer bridging Ultimate Govee with Home Assistant constructs."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any, Awaitable, Callable, Dict, Mapping, MutableMapping, Optional

ChannelMessage = Dict[str, Any]
ScheduleCallback = Callable[[timedelta, Callable[[], Awaitable[Any]]], Callable[[], None]]


@dataclass(frozen=True)
class EntityMetadata:
    """Description of an entity exposed for a device."""

    entity_id: str
    unique_id: str
    platform: str
    translation_key: str
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DeviceMetadata:
    """Metadata returned from the Ultimate Govee API describing a device."""

    device_id: str
    name: str
    model: str
    manufacturer: str
    hw_version: str
    sw_version: str
    channels: Dict[str, Dict[str, Any]]
    entities: list[EntityMetadata]
    default_transport: Optional[str] = None

    @property
    def preferred_transport(self) -> Optional[str]:
        """Return the preferred transport for the device."""

        if self.default_transport:
            return self.default_transport
        if self.channels:
            return next(iter(self.channels.keys()))
        return None


@dataclass(frozen=True)
class CommandRequest:
    """Representation of a command routed via the coordinator."""

    transport: Optional[str]
    payload: Dict[str, Any]


class _CoordinatedDevice:
    """Runtime state wrapper for a discovered device."""

    def __init__(self, metadata: DeviceMetadata):
        self.metadata = metadata
        self.state: Dict[str, Any] = {}

    @property
    def id(self) -> str:
        return self.metadata.device_id

    @property
    def preferred_transport(self) -> Optional[str]:
        return self.metadata.preferred_transport

    async def async_refresh(self, api_client: Any) -> Dict[str, Any]:
        """Refresh device state via the provided API client."""

        state = await api_client.async_get_device_state(self.id)
        if isinstance(state, Mapping):
            self.state.update(state)  # type: ignore[arg-type]
        return self.state

    def apply_event(self, channel: str, message: ChannelMessage) -> None:
        """Apply an incoming event payload to the in-memory state."""

        state = message.get("state")
        if isinstance(state, Mapping):
            self.state.update(state)  # type: ignore[arg-type]


class DataUpdateCoordinator:
    """Minimal stand-in for Home Assistant's DataUpdateCoordinator."""

    def __init__(
        self,
        *,
        update_interval: timedelta,
        schedule_refresh: Optional[ScheduleCallback] = None,
    ) -> None:
        self.update_interval = update_interval
        self._schedule_refresh = schedule_refresh
        self._cancel_refresh: Optional[Callable[[], None]] = None
        self._periodic_task: Optional[asyncio.Task[None]] = None
        self._started = False
        self.data: Any = None

    async def async_start(self) -> None:
        """Begin periodic refresh operations."""

        if self._started or self.update_interval.total_seconds() <= 0:
            self._started = True
            return

        self._started = True
        if self._schedule_refresh is not None:
            self._cancel_refresh = self._schedule_refresh(
                self.update_interval, self.async_refresh
            )
            return

        loop = asyncio.get_running_loop()
        self._periodic_task = loop.create_task(self._run_periodic())

    async def _run_periodic(self) -> None:
        try:
            while self._started:
                await asyncio.sleep(self.update_interval.total_seconds())
                await self.async_refresh()
        except asyncio.CancelledError:
            pass

    async def async_refresh(self) -> Any:
        """Fetch fresh data from the underlying source."""

        self.data = await self._async_update_data()
        return self.data

    async def _async_update_data(self) -> Any:
        raise NotImplementedError

    async def async_stop(self) -> None:
        """Cancel ongoing refresh timers."""

        if not self._started:
            return

        self._started = False
        if self._cancel_refresh is not None:
            self._cancel_refresh()
            self._cancel_refresh = None

        if self._periodic_task:
            self._periodic_task.cancel()
            try:
                await self._periodic_task
            except asyncio.CancelledError:
                pass
            self._periodic_task = None


class UltimateGoveeCoordinator(DataUpdateCoordinator):
    """Owns Ultimate Govee devices and bridges channel events with HA."""

    def __init__(
        self,
        *,
        hass: Any,
        config_entry_id: str,
        api_client: Any,
        channels: Mapping[str, Any],
        device_registry: Any,
        entity_registry: Any,
        update_interval: timedelta,
        schedule_refresh: Optional[ScheduleCallback] = None,
    ) -> None:
        super().__init__(update_interval=update_interval, schedule_refresh=schedule_refresh)
        self.hass = hass
        self._config_entry_id = config_entry_id
        self._api_client = api_client
        self._channels = channels
        self._device_registry = device_registry
        self._entity_registry = entity_registry
        self.devices: MutableMapping[str, _CoordinatedDevice] = {}
        self._subscriptions_bound = False

    async def async_initialize(self) -> None:
        """Discover devices from the API and register them with HA registries."""

        self._ensure_channel_subscriptions()
        discovered: list[DeviceMetadata] = list(
            await self._api_client.async_list_devices()
        )
        for metadata in discovered:
            await self._register_device(metadata)
        await self.async_start()

    async def async_execute_command(
        self, device_id: str, command: CommandRequest
    ) -> None:
        """Publish commands to the proper transport for the device."""

        if device_id not in self.devices:
            raise KeyError(f"Unknown device: {device_id}")

        transport = command.transport or self.devices[device_id].preferred_transport
        if not transport:
            raise ValueError(f"No transport available for device {device_id}")

        channel = self._channels.get(transport)
        if channel is None:
            raise ValueError(f"Transport {transport} is not configured")

        await channel.async_send_command(device_id, command.payload)

    async def _async_update_data(self) -> Dict[str, Dict[str, Any]]:
        """Refresh state for all registered devices."""

        updated: Dict[str, Dict[str, Any]] = {}
        for device_id, device in self.devices.items():
            updated[device_id] = await device.async_refresh(self._api_client)
        return updated

    async def async_stop(self) -> None:  # type: ignore[override]
        await super().async_stop()

    def _ensure_channel_subscriptions(self) -> None:
        if self._subscriptions_bound:
            return
        for name, channel in self._channels.items():
            if hasattr(channel, "subscribe"):
                channel.subscribe(self._handle_channel_event)
        self._subscriptions_bound = True

    async def _register_device(self, metadata: DeviceMetadata) -> None:
        device_entry = await self._device_registry.async_get_or_create(
            config_entry_id=self._config_entry_id,
            identifiers={("ultimate_govee", metadata.device_id)},
            manufacturer=metadata.manufacturer,
            name=metadata.name,
            model=metadata.model,
            sw_version=metadata.sw_version,
            hw_version=metadata.hw_version,
        )
        for entity in metadata.entities:
            await self._entity_registry.async_get_or_create(
                config_entry=self._config_entry_id,
                unique_id=entity.unique_id,
                platform=entity.platform,
                entity_id=entity.entity_id,
                translation_key=entity.translation_key,
                device_id=device_entry["id"],
                **entity.extra,
            )
        device = _CoordinatedDevice(metadata)
        self.devices[metadata.device_id] = device

    def _handle_channel_event(self, channel: str, message: ChannelMessage) -> None:
        device_id = message.get("device_id")
        if not device_id:
            return
        device = self.devices.get(device_id)
        if device is None:
            return
        device.apply_event(channel, message)


__all__ = [
    "CommandRequest",
    "DeviceMetadata",
    "EntityMetadata",
    "UltimateGoveeCoordinator",
]
