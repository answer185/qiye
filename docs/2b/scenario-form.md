---
toc: content
group: 
  title: 开发场景
  order: 30
order: 4
---
# 基于react-hook-form的表单开发
## 预期效果
这个表单页面基于shadcn/ui、react-hook-from及zod开发。具有的表单项类型如下：
- Plain Text: 只展示普通的文本内容，如China
- Input: 普通的Input输入框
- Select: 下拉类型，下拉值为male和female
- MultiSelect: 多选框，其选项可以帮忙设置5个颜色
- Checkbox: 选择框，值和label由你生成，随便来6个即可
- Radio: 单选框，值 为Apple,Huawei,xiaomi
- InputNumber: 数字类型，只有填写数字
- TextArea: 文本框类型
- Switch: switch切换类型
- Email: 邮箱类型
- Mobile: 中国手机号类型
- Mobile(Intl): 国际所有国家的手机号类型，支持先选择区号，如+86
- DatePicker: 选择日期
- DatePicker[showTime]: 选择日期和时间
- MonthPicker: 选择年份和月份
- RangePicker: 选择开始日期和结束日期
- RangePicker[showTime]: 选择开始日期和时间及结束日期和时间
- TimePicker: 选择时间
- Upload[imgage]: 上传图片类型，上传后显示已上传的图片
- Upload[file]: 上传文件类型，上传后，下面显示已上传的文件列表
- ColorPicker: 颜色选择器
- Rate: 5个星的评分效果
- DynamicInput: 有一个Add Field的按钮，点击后，该表单项会增加一个Input输入框，当Input输入框超过两个时，在Input后，有个删除的Icon，可以删除某个Input
- DynamicInput（Multi）: 有一个Add Field的按钮, 点击后会增加两个Input，用与输入First Name和Last Name， 当超过两个后，有个删除的Icon，可以删除某行的那两个数据。
- Province, City, District: 显示中国的省市区联动选择
- 不带label的checkbox选项，其文本展示为： I have read the agreement

以上各表单项均为必填，label和表单项在同一行。
默认表单各项是没有初始值的。
可以点击下面的fill data按钮填充

## 实际效果
[demo](https://admin-template.zengcreates.cn/en/form)
