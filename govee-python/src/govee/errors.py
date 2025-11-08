class GoveeError(Exception):
    def __init__(self, message: str | None = None) -> None:
        super().__init__(f"[Govee] {message or 'Unknown exception occurred'}")


class BaseGoveeApiError(GoveeError):
    def __init__(self, api: str, message: str | None = None) -> None:
        super().__init__(f"[{api}API]{message or 'Unknown exception occurred'}")


class GoveeApiError(BaseGoveeApiError):
    def __init__(self, message: str | None = None) -> None:
        super().__init__("Govee", message)


class GoveeCommunityApiError(BaseGoveeApiError):
    def __init__(self, message: str | None = None) -> None:
        super().__init__("GoveeCommunity", message)

