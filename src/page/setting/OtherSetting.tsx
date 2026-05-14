const OtherSetting: React.FC<{ curTab: string }> = ({ curTab }) => {
  console.log(curTab);
  return (
    <>
      <div>
        提示：
        工具为本地服务，如有需要，可以自行将数据导出为csv文件，联网服务通过apiKey调用用户手动设置接口实现，所有代码，不会被提交到非AI服务以外的第三方，请放心使用
      </div>
    </>
  );
};

export default OtherSetting;
