generate:
	keytool -genkey -alias dmaice -keypass dmaice123456 -keyalg RSA -keysize 1024 -validity 3650 -keystore  dmaice.keystore -storepass dmaice123456 -dname "CN=(刘冰清), OU=(广州起望软件科技有限公司), O=(广州起望软件科技有限公司), L=(广州市), ST=(广东省), C=(QW)"
	keytool -importkeystore -srckeystore dmaice.keystore -destkeystore dmaice.keystore -deststoretype pkcs12