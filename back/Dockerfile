FROM python:3.11.2

RUN mkdir /home/back
WORKDIR /home/back
COPY . /home/back

RUN pip install -r requirements.txt

ENTRYPOINT ["gunicorn", "-k", "gevent", "-w", "1", "--certfile", "/var/www/certs/fullchain.pem", "--keyfile", "/var/www/certs/privkey.pem", "--bind", "0.0.0.0:5001", "app:app"]
