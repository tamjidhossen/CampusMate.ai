from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
import json
import time
from config import (
    VECTOR_DB_PATH, COLLECTION_NAME,
    CHUNK_SIZE, CHUNK_OVERLAP, RETRIEVAL_K,
    QA_FILE, STRUCTURE_FILE, EMBEDDING_MODEL
)

# Initialize embeddings and text splitter
embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
# vector = embeddings.embed_query("Hello world")
# print(vector[:5])

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)

db_location = VECTOR_DB_PATH
add_documents = not os.path.exists(db_location)

# Create vector store
vector_store = Chroma(
    collection_name=COLLECTION_NAME,
    persist_directory=db_location,
    embedding_function=embeddings
)

if add_documents:
    documents = []
    
    total_chunks = 0
    for num in range(15):
        # Load and chunk Teachers data
        with open(f"Data/CSE_Teachers/t{num + 1}.txt", "r", encoding="utf-8") as f:
            teacher_content = f.read()
        
        # Split Teachers content into chunks
        teacher_chunks = text_splitter.split_text(teacher_content)
        
        for i, chunk in enumerate(teacher_chunks):
            if chunk.strip():
                document = Document(
                    page_content=chunk.strip(),
                    metadata={"source": f"t{num + 1}.txt", "chunk": i}
                )
                documents.append(document)
        
        doc_len = len(documents)
        if doc_len >= 20:  # Smaller batches to avoid rate limits
            total_chunks += doc_len
            print(f"Adding {doc_len} chunks to vector store")
            try:
                vector_store.add_documents(documents=documents)
                documents = []
                print(f"Successfully added batch. Waiting 30 seconds...")
                time.sleep(30)  # Shorter delay but more frequent
            except Exception as e:
                print(f"Error adding documents: {e}")
                print("Waiting 60 seconds before retrying...")
                time.sleep(60)
                # Retry with the same documents
                try:
                    vector_store.add_documents(documents=documents)
                    documents = []
                    print("Retry successful")
                except Exception as retry_error:
                    print(f"Retry failed: {retry_error}")
                    break

    if documents:
        try:
            vector_store.add_documents(documents=documents)
            total_chunks += len(documents)
            print(f"Added final batch of {len(documents)} chunks")
        except Exception as e:
            print(f"Error adding final batch: {e}")

    print(f"Total chunks added: {total_chunks}")
    
retriever = vector_store.as_retriever(search_kwargs={"k": RETRIEVAL_K})
