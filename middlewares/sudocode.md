router => upload_lib => controller

validate_input()
validate_files()
handler_error_multer_response()

upload_lib

- validate req (file/files)
- validate size, extension dll
- if error
  - handle_multer_err
- else
  - next

semua ID pindah jadi UUID
