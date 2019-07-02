import com.moowork.gradle.node.npm.NpmTask
import com.moowork.gradle.node.task.NodeTask

plugins {
    id("org.jetbrains.kotlin.jvm").version("1.3.31")
    java
    idea

    id ("org.springframework.boot") version "2.1.3.RELEASE"
    id ("com.moowork.node") version "1.3.1"
    id("io.spring.dependency-management") version "1.0.6.RELEASE"

}

group = "at.ezylot"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()

    flatDir {
        dirs("lib")
    }
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")

    implementation("org.springframework.boot:spring-boot-devtools")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")

    implementation(files("lib/at.jku.iic.droplet.electric.simulator.jar"))

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    //implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
}

tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile::class).all {
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

node {
    version = "10.16.0"
    download = true
}

tasks.create<Delete>("cleanTypescript") {
    delete(fileTree("$buildDir/resources/main/static/scripts").include("**/*.ts"))
}

tasks.create<Delete>("cleanScss") {
    delete(fileTree("$buildDir/resources/main/static/styles").include("**/*.scss", "**/*.sass"))
}

tasks.create<NodeTask>("tsRun") {
    inputs.dir("$projectDir/src/main/resources/static/scripts/")
    outputs.dir("$buildDir/resources/main/static/scripts")
    dependsOn(tasks.npmInstall)
    setArgs(listOf())
    setScript(file("$projectDir/node_modules/typescript/bin/tsc"))
}

tasks.create<NodeTask>("eslint") {
    dependsOn(tasks.npmInstall)
    setArgs(listOf("$projectDir/src/main/resources/static/scripts/**/*.ts"))
    setScript(file("$projectDir/node_modules/eslint/bin/eslint.js"))
}

tasks.create<NodeTask>("scssCompile") {
    inputs.dir("$projectDir/src/main/resources/static/styles/")
    outputs.dir("$buildDir/resources/main/static/styles")
    dependsOn(tasks.npmInstall)
    setArgs(listOf(
        "--recursive",
        "--output", "$buildDir/resources/main/static/styles",
        "--output-style", "compressed",
        //"--source-map", "true",
        "$projectDir/src/main/resources/static/styles/"
    ))
    setScript(file("$projectDir/node_modules/node-sass/bin/node-sass"))
}

tasks.clean.configure {
    delete(file("node_modules"))
}

tasks.processResources {
    dependsOn("eslint", "tsRun", "scssCompile")
    finalizedBy("cleanScss", "cleanTypescript")
}
