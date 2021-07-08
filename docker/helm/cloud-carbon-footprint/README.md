# Pre-requisites

Create a generic secret with AWS credentials, assumed by role https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/cloudformation/ccf-athena.yaml

Example:
```
cat > carbon-creds << EOF
[default]
aws_access_key_id = ${CARBON_AWS_ACCESS_KEY}
aws_secret_access_key = ${CARBON_AWS_SECRET_KEY}
EOF
kubectl create secret generic carbon-aws-credentials --from-file=./carbon-creds \
      -n ns --dry-run -o yaml | kubectl apply -f -
```

# Usage

```
helm upgrade --install cloud-carbon-footprint ./helm/cloud-carbon-footprint --namespace=ns -f values.yml
```

# Testing

```
helm template ./helm/cloud-carbon-footprint --namespace=ns -f ./helm/cloud-carbon-footprint/values.yaml
```