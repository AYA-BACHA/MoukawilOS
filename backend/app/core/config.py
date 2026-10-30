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
    test_user_id: str = ""
    enable_demo_mode: bool = True
    demo_auth_token: str = "demo"
    demo_user_id: str = "0d8a54fe-b098-4fe9-be73-47afc3218772"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()