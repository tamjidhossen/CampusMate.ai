from fastapi import FastAPI
from pydantic import BaseModel
import time

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from vector import retriever
from config import LLM_MODEL, CHATBOT_TEMPLATE

app = FastAPI()

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
    
    context = retriever.invoke(question)
    start_time = time.time()
    result = chain.invoke({"context": context, "question": question})
    elapsed_time = time.time() - start_time
    
    return {
        "response": result.content,
        "response_time": f"{elapsed_time:.2f}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

