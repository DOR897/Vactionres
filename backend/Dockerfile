# File: Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .


# Expose the application port
EXPOSE 8800

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8800"]
