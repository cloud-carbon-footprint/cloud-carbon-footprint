data "aws_region" "main" {}

data "aws_availability_zone" "main" {
  for_each = { for subnet in local.subnets : subnet => "${data.aws_region.main.name}${subnet}" }

  name = each.value
}

resource "aws_vpc" "main" {
  cidr_block         = var.cidr
  enable_dns_support = true

  tags = {
    Name = "${local.base_name}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_eip" "nat" {
  vpc = true
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = values(aws_subnet.public)[0].id
  tags = {
    Name = "${local.base_name}-nat"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${local.base_name}-private-route-table"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${local.base_name}-public-route-table"
  }
}

resource "aws_subnet" "private" {
  for_each = data.aws_availability_zone.main

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr, 8, index(keys(data.aws_availability_zone.main), each.key))
  availability_zone = each.value.name
  tags = {
    Name = "${local.base_name}-private-subnet-${each.key}"
  }
}

resource "aws_subnet" "public" {
  for_each = data.aws_availability_zone.main

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr, 8, 128 + index(keys(data.aws_availability_zone.main), each.key))
  availability_zone = each.value.name
  tags = {
    Name = "${local.base_name}-public-subnet-${each.key}"
  }
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route" "private_nat_gateway" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}

resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private

  subnet_id      = each.value.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}
