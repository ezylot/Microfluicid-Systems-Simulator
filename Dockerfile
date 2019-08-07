FROM adoptopenjdk/openjdk11:latest

WORKDIR /app

COPY settings.gradle.kts build.gradle.kts gradlew /app/
COPY gradle /app/gradle
RUN ./gradlew tasks -Dorg.gradle.daemon=false && rm -rf ~/.gradle && rm -rf ~/.npm && rm -rf ~/.kotlin

ADD . /app
RUN ./gradlew assemble -Dorg.gradle.daemon=false && rm -rf ~/.gradle && rm -rf ~/.npm && rm -rf ~/.kotlin

EXPOSE 8080
CMD ["java", "-jar", "build/libs/fluidsimulator-0.0.1-SNAPSHOT.jar"]
