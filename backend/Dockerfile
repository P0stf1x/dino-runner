FROM python:3.14-alpine

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

CMD ["fastapi", "dev", "--host", "0.0.0.0", "app/main.py", "--port", "80", "--proxy-headers"]
