# RAG API Documentation

This document provides detailed information about the RAG API endpoints.

## Base URL

The base URL for the API is `http://127.0.0.1:8000`.

## Endpoints

### 1. Root

- **URL:** `/`
- **Method:** `GET`
- **Description:** A welcome message to confirm the API is running.
- **Response:**
  ```json
  {
    "message": "Welcome to the RAG API"
  }
  ```

### 2. Chat

- **URL:** `/chat`
- **Method:** `POST`
- **Description:** Takes a user's question and returns a response from the RAG model.
- **Request Body:**
  ```json
  {
    "question": "Your question here"
  }
  ```
- **Response:**
  ```json
  {
    "response": "The answer from the RAG model.",
    "response_time": "The time taken to generate the response in seconds."
  }
  ```

#### Example

**Request:**

```bash
curl -X POST "http://127.0.0.1:8000/chat" -H "Content-Type: application/json" -d '{"question": "Who is the head of the CSE department?"}'
```

**Response:**

```json
{
  "response": "The head of the Computer Science and Engineering department is Dr. John Doe.",
  "response_time": "1.23"
}
```
