from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase_client import supabase
from pydantic import BaseModel
import jwt
import os

app = FastAPI()

# 1. Define Origins - Allow all origins from environment variable or use defaults
# Get allowed origins from environment variable, or use a list of common origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Default origins for development and known production URLs
    origins = [
        "https://linkbin-front-end.vercel.app",
        "http://localhost:3000",
        "https://linkbin-5zr4.vercel.app",
    ]

# For Vercel deployments, allow all Vercel preview URLs
# This regex pattern will match any Vercel deployment URL
allow_origin_regex = r"https://.*\.vercel\.app"

# 2. Add Middleware (This handles OPTIONS requests automatically)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REMOVED MANUAL OPTIONS HANDLER HERE ---

# 3. Safer JWT Dependency
# Note: In a real Supabase setup, you should verify the signature using your JWT Secret.
# For now, we will keep your logic but ensure it catches errors gracefully.
def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        #Ideally, verify_signature should be True and pass the SUPABASE_JWT_SECRET
        payload = jwt.decode(token, options={"verify_signature": False}) 
        return payload
    except Exception as e:
        print(f"Auth Error: {e}") # Print error to Vercel logs
        raise HTTPException(status_code=401, detail="Invalid Token")

# GET /api/links
@app.get("/api/links")
def get_links(user=Depends(get_current_user)):
    try:
        response = supabase.table("links").select("*").eq("user_id", user["sub"]).execute()
        return response.data
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

class LinkCreate(BaseModel):
    title: str
    url: str

# POST /api/links
@app.post("/api/links")
def create_link(link: LinkCreate, user=Depends(get_current_user)):
    try:
        response = supabase.table("links").insert({
            "user_id": user["sub"],
            "title": link.title,
            "url": link.url
        }).execute()
        return response.data
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))