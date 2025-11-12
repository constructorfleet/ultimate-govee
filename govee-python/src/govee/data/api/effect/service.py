from __future__ import annotations

import logging
from typing import Any, Callable, Dict, List, Optional

from .models import LightEffect

logger = logging.getLogger(__name__)


class GoveeEffectService:
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

    async def get_light_effects(
        self, auth_state: Any, model: str, goods_type: int, device_id: str
    ) -> List[LightEffect]:
        if not getattr(auth_state, "token", auth_state):
            logger.error(
                f"Unable to retrieve Light Effects for {device_id}: not authenticated"
            )
            return []
        try:
            req = await self._make_req(
                "https://app2.govee.com/appsku/v1/effects/list",
                headers={"authorization": getattr(auth_state, "token", "")},
                payload={"sku": model, "goodsType": goods_type, "device": device_id},
            )
            resp = await req.get()
            data = resp.get("data", resp)
            effects_raw = []
            if isinstance(data, dict):
                effects_raw = data.get("effects", [])
            effects: List[LightEffect] = []
            for e in effects_raw:
                effects.append(
                    LightEffect(
                        name=e.get("name"), id=e.get("id"), op_str_base64=e.get("opStr")
                    )
                )
            return effects
        except Exception as e:
            logger.error("Unable to retrieve light effects", exc_info=e)
            return []
