from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from supabase_client import supabase
import jwt

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://linkbin-front-end.vercel.app/"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Authentication dependency
def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

# GET /api/links
@app.get("/api/links")
def get_links(user=Depends(get_current_user)):
    data = supabase.table("links").select("*").eq("user_id", user["sub"]).execute()
    return data.data

# POST /api/links
from pydantic import BaseModel

class LinkCreate(BaseModel):
    title: str
    url: str

@app.post("/api/links")
def create_link(link: LinkCreate, user=Depends(get_current_user)):
    response = supabase.table("links").insert({
        "user_id": user["sub"],
        "title": link.title,
        "url": link.url
    }).execute()
    return response.data
