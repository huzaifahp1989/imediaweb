plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.imediac.islammediacentral"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.imediac.islammediacentral"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "DEFAULT_RADIO_URL", "\"https://a4.asurahosting.com:7820/radio.mp3\"")
        buildConfigField("String", "SUPABASE_URL", "\"https://pmxahrmjxbfzuyqeoraz.supabase.co\"")
        // Public Islamic Audio Library (create-me-a-audio.vercel.app) — anon key is client-safe
        buildConfigField(
            "String",
            "AUDIO_LIBRARY_SUPABASE_URL",
            "\"https://thywxzrrurfhdnhybjdz.supabase.co\""
        )
        buildConfigField(
            "String",
            "AUDIO_LIBRARY_SUPABASE_ANON_KEY",
            "\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoeXd4enJydXJmaGRuaHliamR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzYzODMsImV4cCI6MjA4MzY1MjM4M30.ahdaPHhq6UHAx7V8WTCVGV-pp7dw66cZF8rk4FyE8So\""
        )
        buildConfigField("String", "IMC_STREAMS_SITE", "\"https://traet2lhw4m4.vercel.app/\"")
        buildConfigField("String", "AUDIO_LIBRARY_SITE", "\"https://create-me-a-audio.vercel.app/\"")
        buildConfigField(
            "String",
            "ANDROID_AUTO_APK_URL",
            "\"https://imediackids.com/downloads/islam-media-central.apk\""
        )
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Sideload testing: sign with debug keystore, no .debug applicationId suffix.
            // Replace with a real release keystore before Play Store upload.
            signingConfig = signingConfigs.getByName("debug")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    testOptions {
        unitTests.isIncludeAndroidResources = true
    }
}

dependencies {
    val media3 = "1.5.1"

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-service:2.8.7")

    // AndroidX Media3 — session, exoplayer, UI helpers for Auto + notifications
    implementation("androidx.media3:media3-exoplayer:$media3")
    implementation("androidx.media3:media3-exoplayer-hls:$media3")
    implementation("androidx.media3:media3-session:$media3")
    implementation("androidx.media3:media3-ui:$media3")
    implementation("androidx.media3:media3-common:$media3")

    // Local persistence for favorites, recently played, podcast resume
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("com.google.code.gson:gson:2.11.0")

    // Artwork loading for MediaItem bitmaps
    implementation("com.github.bumptech.glide:glide:4.16.0")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.robolectric:robolectric:4.14.1")
    testImplementation("androidx.test:core:1.6.1")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
