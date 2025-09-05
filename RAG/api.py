from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from vector import retriever
from config import LLM_MODEL, CHATBOT_TEMPLATE

app = FastAPI(title="CampusMate AI RAG API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = ChatGoogleGenerativeAI(model=LLM_MODEL)

template = CHATBOT_TEMPLATE
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the RAG API"}

@app.post("/chat")
def chat(request: ChatRequest):
    question = request.question
    
    try:
        context = retriever.invoke(question)
        start_time = time.time()
        result = chain.invoke({"context": context, "question": question})
        elapsed_time = time.time() - start_time
        
        return {
            "response": result.content,
            "response_time": f"{elapsed_time:.2f}",
            "status": "success"
        }
    except Exception as e:
        return {
            "response": "I'm sorry, I encountered an error processing your request. Please try again later.",
            "response_time": "0.00",
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)

