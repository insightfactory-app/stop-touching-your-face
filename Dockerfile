FROM tiangolo/uvicorn-gunicorn-starlette:python3.7

EXPOSE 5000
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
ENV http_proxy=
ENV https_proxy=
ENV no_proxy=
RUN pip install -r  requirements.txt

CMD ["gunicorn","-b", "0.0.0.0:5000", "app","-k","gevent","-w","5","--worker-connections=100"]
