# Criando a imagem intermediária de build da aplicação
FROM golang:1.20.3-bullseye as build

# Definindo as variáveis de ambiente
ENV PATH="/root/.cargo/bin:${PATH}"
ENV USER=root

# Instalando o Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \ 
    && rustup default stable \ 
    && rustup target add x86_64-unknown-linux-gnu

WORKDIR /go/src
RUN ln -sf /bin/bash /bin/sh
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .

# Compilando a biblioteca do tiktoken
RUN cd tiktoken-cffi && \
    cargo build --release --target=x86_64-unknown-linux-gnu && \
    mkdir -p /go/pkg/mod/github.com/j178/tiktoken-go@v0.2.1/tiktoken-cffi/target/release/ && \
    cp target/x86_64-unknown-linux-gnu/release/libtiktoken.a /go/pkg/mod/github.com/j178/tiktoken-go@v0.2.1/tiktoken-cffi/target/release/libtiktoken.a


# Compilando a aplicação
RUN cd /go/src && \
    GOOS=linux CGO_ENABLED=1 go build -o chatservice cmd/chatservice/main.go

# Criação da imagem final
FROM golang:1.20.3

RUN curl -s https://packagecloud.io/install/repositories/golang-migrate/migrate/script.deb.sh | bash && \
    apt-get update && \
    apt-get install migrate

# Definindo o Workdir
WORKDIR /app

# Copy files and directories from the build stage
COPY --from=build /go/src/chatservice .
COPY --from=build /go/src/tiktoken-cffi/libtiktoken.a libtiktoken/
COPY --from=build /go/src/entrypoint.sh .
COPY --from=build /go/src/.env.example .env
COPY --from=build /go/src/sql/migrations/ sql/

ENV MODEL="gpt-3.5-turbo"
ENV MODEL_MAX_TOKENS="4096"
ENV TEMPERATURE="0.2"
ENV TOP_P="0.2"
ENV N="1"
ENV MAX_TOKENS="300"
ENV STOP="['\\super-end\\']"

RUN chmod +x ./entrypoint.sh
# Comando de inicialização da aplicação
CMD ["./entrypoint.sh"]
