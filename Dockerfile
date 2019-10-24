FROM adoptopenjdk/openjdk11:latest

WORKDIR /app

COPY settings.gradle.kts build.gradle.kts gradlew /app/
COPY gradle /app/gradle
RUN ./gradlew -i resolveDependencies -Dorg.gradle.daemon=false

COPY package.json package-lock.json /app/
RUN ./gradlew -i npmInstall -Dorg.gradle.daemon=false

ADD . /app
RUN ./gradlew -i assemble -Dorg.gradle.daemon=false \
    && cp build/libs/fluidsimulator-0.0.1-SNAPSHOT.jar . \
    && rm -rf ~/.gradle \
    && rm -rf ~/.npm \
    && rm -rf ~/.kotlin \
    && rm -rf /tmp \
    && mkdir /tmp \
    && find . -mindepth 1 -maxdepth 1 ! -name "fluidsimulator-0.0.1-SNAPSHOT.jar" -exec rm -rv {} +

EXPOSE 8080
CMD ["java", "-jar", "fluidsimulator-0.0.1-SNAPSHOT.jar"]
