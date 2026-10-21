FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and train model
COPY . .
RUN python train_model.py

# Expose port (7860 for Hugging Face Spaces / default cloud)
EXPOSE 7860
ENV PORT=7860

CMD ["python", "app.py"]
