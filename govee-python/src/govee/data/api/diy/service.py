"""Govee DIY service minimal port.

This implements get_diy_effects(auth_state, model, goods_type, device_id)
using the request factory used elsewhere in the Python package. It mirrors the
behavior of the TS service: returns an empty list when unauthenticated or on
errors, and maps the API response into DiyEffect dataclasses.
"""

from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional

from .bff_models import OneClickResponse
from .models import DiyEffect

logger = logging.getLogger(__name__)


class GoveeDiyService:
    def __init__(self, request: Optional[Callable[..., Any]] = None):
        from govee.data.utils.request import request as request_factory

        self._request = request or request_factory

    async def _make_req(
        self,
        url: str,
        headers: Dict[str, Any],
        payload: Optional[Dict[str, Any]] = None,
    ):
        import inspect

        if inspect.iscoroutinefunction(self._request):
            return await self._request(url, headers, payload)
        return self._request(url, headers, payload)

    async def get_diy_effects(
        self, auth_state: Any, model: str, goods_type: int, device_id: str
    ) -> List[DiyEffect]:
        # lightweight auth check: expect auth_state to have token or be truthy
        if not getattr(auth_state, "token", auth_state):
            logger.error(
                f"Unable to retrieve DIY Effects for {device_id}: not authenticated"
            )
            return []

        try:
            req = await self._make_req(
                "https://app2.govee.com/appsku/v1/diys/groups-diys",
                headers={"authorization": getattr(auth_state, "token", "")},
                payload={"sku": model, "goodsType": goods_type, "device": device_id},
            )
            resp = await req.get()
            data = resp.get("data", resp)
            # Support multiple response shapes seen in the JS implementation:
            # { data: { diys: { diyGroups: [...] } } } or { data: { diyGroups: [...] } }
            diy_groups = []
            if isinstance(data, dict):
                if "diys" in data and isinstance(data.get("diys"), dict):
                    diy_groups = data.get("diys", {}).get("diyGroups", [])
                else:
                    diy_groups = data.get("diyGroups", [])
            effects: List[DiyEffect] = []
            for group in diy_groups:
                for diy in group.get("diys", []):
                    effects.append(
                        DiyEffect(
                            name=diy.get("diyName"),
                            code=diy.get("diyCode"),
                            cmd_version=0,
                            type=diy.get("effectType"),
                            diy_op_code_base64=diy.get("effectStr"),
                        )
                    )
            return effects
        except Exception as e:
            logger.error("Unable to retrieve device diys", exc_info=e)
            return []

    async def get_one_clicks(self, auth_state: Any) -> List[OneClickResponse]:
        # minimal auth check
        if not getattr(auth_state, "token", auth_state):
            logger.error("Unable to retrieve One-Click actions: not authenticated")
            raise RuntimeError("Not Authenticated")
        try:
            req = await self._make_req(
                "https://app2.govee.com/bff-app/v1/exec-plat/one-click-rules",
                headers={"authorization": getattr(auth_state, "token", "")},
            )
            resp = await req.get()
            data = resp.get("data", resp)
            component_data = (
                data.get("componentData") if isinstance(data, dict) else None
            )
            components = (
                component_data.get("components", [])
                if isinstance(component_data, dict)
                else []
            )
            one_clicks: List[OneClickResponse] = []
            for comp in components:
                if "oneClicks" in comp:
                    for oc in comp.get("oneClicks", []):
                        one_clicks.append(OneClickResponse(**oc))
            return one_clicks
        except Exception as e:
            logger.error("Error retrieving OneClicks from Govee", exc_info=e)
            raise
