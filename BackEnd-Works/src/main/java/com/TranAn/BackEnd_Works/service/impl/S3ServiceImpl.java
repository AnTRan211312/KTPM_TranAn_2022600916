package com.TranAn.BackEnd_Works.service.impl;

import com.TranAn.BackEnd_Works.advice.exception.S3UploadException;
import com.TranAn.BackEnd_Works.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String awsBucketName;
    private final String awsRegion;

    @Override
    public String uploadFile(MultipartFile file, String folder, String fileName, boolean getUrl) {
        try {
            if (file == null || file.isEmpty()) {
                throw new S3UploadException("Tệp không được rỗng hoặc null");
            }
            String key = String.format("%s/%s", folder, fileName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(awsBucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            if (getUrl)
                return String.format("https://%s.s3.%s.amazonaws.com/%s", awsBucketName, awsRegion, key);
            else
                return key;
        } catch (IOException e) {
            throw new S3UploadException("Lỗi khi đọc dữ liệu từ tệp");
        } catch (Exception e) {
            throw new S3UploadException("Lỗi khi upload file lên S3");
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String key, boolean getUrl) {
        try {
            if (file == null || file.isEmpty())
                throw new S3UploadException("Tệp logo không được rỗng hoặc null");

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(awsBucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

            if (getUrl)
                return String.format("https://%s.s3.%s.amazonaws.com/%s", awsBucketName, awsRegion, key);
            else
                return key;
        } catch (IOException e) {
            throw new S3UploadException("Lỗi khi đọc dữ liệu từ tệp logo");
        } catch (Exception e) {
            throw new S3UploadException("Lỗi khi upload file lên S3");
        }
    }

    @Override
    @Cacheable(cacheNames = "presign", key = "#key + ':' + #expireDuration.seconds")
    public String generatePresignedUrl(String key, Duration expireDuration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(awsBucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .getObjectRequest(getObjectRequest)
                .signatureDuration(expireDuration)
                .build();

        URL presignedUrl = s3Presigner.presignGetObject(presignRequest).url();
        return presignedUrl.toString();
    }

    @Override
    public void deleteFileByUrl(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isBlank()) {
                return;
            }

            String objectKey = extractObjectKeyFromUrl(fileUrl);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(awsBucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);

        } catch (Exception e) {
            // Log warning instead of throwing exception - file may not exist
            System.err.println("Warning: Could not delete file from S3: " + fileUrl + ". Error: " + e.getMessage());
        }

    }

    @Override
    public void deleteFileByKey(String key) {
        try {
            if (key == null || key.isBlank()) {
                return;
            }

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(awsBucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);

        } catch (Exception e) {
            // Log warning instead of throwing exception - file may not exist
            System.err.println("Warning: Could not delete file from S3 by key: " + key + ". Error: " + e.getMessage());
        }

    }

    private String extractObjectKeyFromUrl(String url) {
        String base = String.format("https://%s.s3.%s.amazonaws.com/", awsBucketName, awsRegion);
        if (!url.startsWith(base)) {
            throw new S3UploadException("URL không hợp lệ hoặc không thuộc bucket hiện tại");
        }
        return url.substring(base.length());
    }
}
