const numberReg = /^-?[0-9]*.?[0-9]*$/;
const intReg = /^-?[1-9][0-9]*$/;
const phoneReg = /^1[0-9]{10,10}$/;
const emailReg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
//密码类型
const pwdReg = /^.{6,16}$/;
const inviteCodeReg = /^[a-zA-Z0-9]{6,16}$/;
//货币类型;
const moneyReg = /^([\u0024\u00A2\u00A3\u00A4\u20AC\u00A5\u20B1\20B9\uFFE5]\s*)(\d+,?)+\.?\d*\s*$/;

export default {
	isNumber: function(val) {
		return numberReg.test(val)
	},
	isInt: function(val) {
		return intReg.test(val)
	},
	isPhone: function(val) {
		return phoneReg.test(val)
	},
	isEmail: function(val) {
		return emailReg.test(val)
	},
	isPwd: function(val) {
		return pwdReg.test(val)
	},
	isInviteCode: function(val) {
		return inviteCodeReg.test(val)
	},
	validate: function(data, rules) {
		let res = { isOk: true, errmsg: '' }
		if (!rules || !rules.length) {
			return res
		}
		for (let rule of rules) {
			// rule: {name:'', type:'', errmsg:'', min:1, max:2, eq:'', required:Boolean, regex:''}
			if (!rule || !rule.name || !rule.type) {
				continue
			}
			let _nullMsg = rule.nullmsg;
			let _msg = rule.errmsg||rule.nullmsg;
			// 如果值不存在
			if (!data[rule.name]) {
				// 如果是必填项就返回错误提示，required可以作为type是为了不同的type能给用户不同的提示
				if (rule.type === 'required' || rule.required) {
					res = { isOk: false, errmsg: _nullMsg }
					if (!_nullMsg) {
						res.errmsg = '请正确输入所有数据' //默认提示
					}
					return res;
				}
				// 如果不是必填项就跳过
				continue;
			}
			switch (rule.type) {
				// required 上面已经判断过了
				case 'equals':
				case 'eq':
					if (data[rule.name] !== data[rule.eqName]) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'number':
					if (!numberReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'int':
					if (!intReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'phone':
					if (!phoneReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'email':
					if (!emailReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'pwd':
					if (!pwdReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'inviteCode':
					if (!inviteCodeReg.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'range': // 数字类型的值取值范围
					// {name: 'xxx', type: 'range', min: 6, max: 6, required: true, errmsg: 'xxx'}
					let val = data[rule.name]
					if (val) {
						if (numberReg.test(val)) {
							if (rule.min>-1 && val < rule.min) {
								res = { isOk: false, errmsg: _msg }
							} else if (rule.max && val > rule.max) {
								res = { isOk: false, errmsg: _msg }
							}
						} else {
							res = { isOk: false, errmsg: _msg }
						}
					}
				break
				case 'lengthRange': // 字符串长度取值范围
					// {name: 'xxx', type: 'lengthRange', min: 6, max: 6, errmsg: 'xxx'}
					let le = data[rule.name] ? data[rule.name].length : 0
					if (rule.min && le < rule.min) {
						res = { isOk: false, errmsg: _msg }
					} else if (rule.max && le > rule.max) {
						res = { isOk: false, errmsg: _msg }
					}
				break
				case 'regex': // 自定义正则表达式
					// {name: 'xxx', type: 'regex', regex: /^1[0-9]{10,10}$/, errmsg: 'xxx'}
					if (rule.regex && !rule.regex.test(data[rule.name])) {
						res = { isOk: false, errmsg: _msg }
					}
				break
			}
			// 发现任何一个错误就立即返回，后面的不再判断
			if (!res.isOk) {
				if (!res.errmsg) {
					res.errmsg = '请正确输入所有数据' //默认提示
				}
				return res
			}
		}
		return res
	}
}