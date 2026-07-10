variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "flipkart-clone"
}

variable "docdb_master_username" {
  description = "DocumentDB master username"
  type        = string
  default     = "flipkartadmin"
}

variable "docdb_master_password" {
  description = "DocumentDB master password"
  type        = string
  sensitive   = true
}
