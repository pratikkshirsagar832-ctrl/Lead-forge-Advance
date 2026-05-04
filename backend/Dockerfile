FROM python:3.11-slim

# Install Go
RUN apt-get update && apt-get install -y wget \
    && wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz \
    && rm go1.21.6.linux-amd64.tar.gz \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH=$PATH:/usr/local/go/bin

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy everything
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
