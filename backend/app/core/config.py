from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    port: int = 8000
    frontend_url: str = "http://localhost:3000"
    database_url: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    rag_service_url: str = "http://localhost:8001"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def check_required(self) -> None:
        """Fail at startup, with the variable names, instead of at the first request."""
        missing = [n.upper() for n in ("database_url", "supabase_url") if not getattr(self, n)]
        if self.app_env != "development":
            missing += [n.upper() for n in ("supabase_anon_key", "supabase_service_role_key")
                        if not getattr(self, n)]
        if missing:
            raise RuntimeError(f"missing environment variables: {', '.join(missing)}")


settings = Settings()