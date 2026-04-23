package com.enquire

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class NativeActionsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext),
  ActivityEventListener {

  companion object {
    private const val PICK_PDF_REQUEST_CODE = 22041
  }

  private var pickPdfPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = "NativeActions"

  @ReactMethod
  fun pickPdf(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Unable to open file picker right now.")
      return
    }

    if (pickPdfPromise != null) {
      promise.reject("PICKER_BUSY", "A document picker request is already in progress.")
      return
    }

    val intent =
      Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "application/pdf"
        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/pdf"))
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
      }

    pickPdfPromise = promise

    try {
      activity.startActivityForResult(
        Intent.createChooser(intent, "Select GST Certificate"),
        PICK_PDF_REQUEST_CODE
      )
    } catch (error: Exception) {
      pickPdfPromise = null
      promise.reject("PICKER_ERROR", error.message, error)
    }
  }

  @ReactMethod
  fun shareImage(filePath: String, message: String?, chooserTitle: String?, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Unable to share the QR image right now.")
      return
    }

    try {
      val imageFile = File(filePath)
      if (!imageFile.exists()) {
        promise.reject("FILE_NOT_FOUND", "QR image file is not available.")
        return
      }

      val uri =
        FileProvider.getUriForFile(
          reactContext,
          "${reactContext.packageName}.fileprovider",
          imageFile
        )

      val shareIntent =
        Intent(Intent.ACTION_SEND).apply {
          type = "image/*"
          putExtra(Intent.EXTRA_STREAM, uri)
          if (!message.isNullOrBlank()) {
            putExtra(Intent.EXTRA_TEXT, message)
          }
          putExtra(Intent.EXTRA_SUBJECT, chooserTitle ?: "PreviewTax QR Code")
          clipData = ClipData.newUri(
            reactContext.contentResolver,
            "PreviewTax QR Code",
            uri
          )
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

      activity.startActivity(Intent.createChooser(shareIntent, chooserTitle ?: "Share QR Code"))
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SHARE_ERROR", error.message, error)
    }
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    if (requestCode != PICK_PDF_REQUEST_CODE) {
      return
    }

    val promise = pickPdfPromise
    pickPdfPromise = null

    if (promise == null) {
      return
    }

    if (resultCode != Activity.RESULT_OK || data?.data == null) {
      promise.resolve(null)
      return
    }

    val uri = data.data ?: run {
      promise.resolve(null)
      return
    }

    try {
      val readPermissionFlag = data.flags and Intent.FLAG_GRANT_READ_URI_PERMISSION
      if (readPermissionFlag != 0) {
        try {
          reactContext.contentResolver.takePersistableUriPermission(uri, readPermissionFlag)
        } catch (_: SecurityException) {
        }
      }

      promise.resolve(buildDocumentMap(uri))
    } catch (error: Exception) {
      promise.reject("PICKER_RESULT_ERROR", error.message, error)
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  private fun buildDocumentMap(uri: Uri) =
    Arguments.createMap().apply {
      putString("uri", uri.toString())
      putString("type", reactContext.contentResolver.getType(uri) ?: "application/pdf")

      val details = queryOpenableDetails(uri)
      putString("fileName", details.first ?: "gst-certificate.pdf")
      putDouble("fileSize", (details.second ?: 0L).toDouble())
    }

  private fun queryOpenableDetails(uri: Uri): Pair<String?, Long?> {
    var fileName: String? = null
    var fileSize: Long? = null

    val cursor: Cursor? =
      reactContext.contentResolver.query(uri, null, null, null, null)

    cursor?.use {
      val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)

      if (it.moveToFirst()) {
        if (nameIndex >= 0) {
          fileName = it.getString(nameIndex)
        }

        if (sizeIndex >= 0 && !it.isNull(sizeIndex)) {
          fileSize = it.getLong(sizeIndex)
        }
      }
    }

    return Pair(fileName, fileSize)
  }
}
