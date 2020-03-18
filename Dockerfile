FROM tiangolo/uvicorn-gunicorn-starlette:python3.7

EXPOSE 5000
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
ENV http_proxy=
ENV https_proxy=
ENV no_proxy=
RUN apt-get update && apt-get -y install cmake protobuf-compiler
RUN apt-get -y install libopenblas-dev liblapack-dev
RUN pip install cmake
RUN apt-get -y update
RUN apt-get install -y --fix-missing \
    build-essential \
    cmake \
    gfortran \
    git \
    wget \
    curl \
    graphicsmagick \
    libgraphicsmagick1-dev \
    libatlas-base-dev \
    libavcodec-dev \
    libavformat-dev \
    libgtk2.0-dev \
    libjpeg-dev \
    liblapack-dev \
    libswscale-dev \
    pkg-config \
    python3-dev \
    python3-numpy \
    software-properties-common \
    zip \
    && apt-get clean && rm -rf /tmp/* /var/tmp/*

RUN cd ~ && \
    mkdir -p dlib && \
    git clone -b 'v19.9' --single-branch https://github.com/davisking/dlib.git dlib/ && \
    cd  dlib/ && \
    python3 setup.py install --yes USE_AVX_INSTRUCTIONS
RUN pip install -r  requirements.txt

CMD ["gunicorn","-b", "0.0.0.0:5000", "app:app","-k","uvicorn.workers.UvicornWorker","-w","5","--worker-connections=100"]
