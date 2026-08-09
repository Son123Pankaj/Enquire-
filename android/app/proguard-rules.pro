# React Native & Native Modules Keep Rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class io.agora.** { *; }
-keep class com.oblador.vectoricons.** { *; }

-dontwarn com.facebook.react.**
-dontwarn io.agora.**
-dontwarn okhttp3.**
-dontwarn okio.**
