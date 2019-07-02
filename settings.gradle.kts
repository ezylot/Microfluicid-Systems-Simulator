pluginManagement {
    repositories {
        gradlePluginPortal()
    }
}
rootProject.name = "fluidsimulator"

if (File(rootDir, "../gradle-node-plugin-1.3.1").exists()) {
    includeBuild("../gradle-node-plugin-1.3.1")
}
