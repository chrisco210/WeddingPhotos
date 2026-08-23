variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "distribution_name" {
  description = "CloudFront Distribution Name"
  type = string
  default = "PhotoDistribution"
}