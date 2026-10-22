#!/bin/sh
# Generate a diverse test certificate set and the subject-hash oracle
# used to verify our JS implementation against OpenSSL.
set -e
cd "$(dirname "$0")"
mkdir -p certs
rm -f certs/* oracle.txt

gen() {
  name="$1"; subj="$2"; shift 2
  openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/$name.key \
    -out certs/$name.pem -days 3650 -subj "$subj" "$@" 2>&1 | grep -v '^\.\.' | grep -vi 'warning\|Generating\|writing new private' || true
  [ -f certs/$name.pem ] || { echo "FAILED: $name ($subj)"; exit 1; }
  h=$(openssl x509 -in certs/$name.pem -noout -subject_hash)
  echo "$name $h" >> oracle.txt
  # also dump the subject string type for debugging
  t=$(openssl x509 -in certs/$name.pem -noout -text 2>/dev/null \
      | grep -A2 'Subject:' | tail -n +2 | tr -d ' \n' | cut -c1-80)
  echo "  ^-- $t" >> oracle.txt
}

echo "generating ..."

gen simple        "/CN=Simple"
gen mixedcase     "/CN=MiXeD   CaSe    Name"
gen chinese       "/CN=测试证书"
gen multirdn      "/C=US/O=Org Name/CN=Test"
gen email         "/CN=Test/emailAddress=a@b.com"
gen padded        "/CN=  Padded   Value  "
gen symbol        "/CN=O'Brien & Sons (Co)"
gen digits        "/CN=1234567890"
gen longcn        "/CN=This Is A Rather Long Common Name For Testing Hashes"
gen spacesmid     "/CN=A  B"
gen upper         "/CN=UPPERCASE NAME"
gen utf8force     "/CN=UTF8 Mode" -utf8
gen multival      "/C=US+O=Org/CN=Test" -multivalue-rdn
gen multival2     "/O=Alpha+OU=Beta/CN=Multi Value RDN" -multivalue-rdn
gen utf8mix       "/O=组织名/CN=Mixed 中英 Certificate"
gen stlq          "/C=CN/ST=Beijing/L=Chaoyang/O=Test Org/OU=Dev/CN=Full Subject"
gen leadingws     "/CN=   Leading"

echo "done. oracle:"
cat oracle.txt
