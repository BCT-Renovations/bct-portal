-- Match private storage enforcement to the V46 upload UI: maximum 25 MB per file.
update storage.buckets
set file_size_limit=26214400
where id in('bct-project-files','bct-contractor-documents');
