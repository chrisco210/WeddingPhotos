locals {
  folder_path = "${path.module}/content" 
}

resource "aws_s3_object" "photo_upload" {
  for_each = fileset(local.folder_path, "**/*.jpg")

  bucket = aws_s3_bucket.photo_source.id
  key    = "content/${each.value}"
  source = "${local.folder_path}/${each.value}"

  etag = filemd5("${local.folder_path}/${each.value}")

  content_type = lookup(
    {
      "html" = "text/html",
      "css"  = "text/css",
      "js"   = "application/javascript",
      "png"  = "image/png",
      "jpg"  = "image/jpeg",
      "json" = "application/json"
    },
    element(split(".", each.value), length(split(".", each.value)) - 1),
    "application/octet-stream"
  )
}