FROM registry.access.redhat.com/ubi8/python-312

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

USER 1001
EXPOSE 5000

CMD ["python", "app.py"]