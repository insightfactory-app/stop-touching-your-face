FROM tiangolo/uvicorn-gunicorn-starlette:python3.7

EXPOSE 5000
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
ENV http_proxy=
ENV https_proxy=
ENV no_proxy=
RUN apt-get update && apt-get -y install cmake protobuf-compiler
RUN apt-get install libopenblas-dev liblapack-dev
RUN pip install cmake
RUN pip install -r  requirements.txt

CMD ["gunicorn","-b", "0.0.0.0:5000", "app:app","-k","uvicorn.workers.UvicornWorker","-w","5","--worker-connections=100"]
