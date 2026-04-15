type TypeProps = {
  labelText: string;
  children?: React.ReactNode;
  mode?: "model" | "base";
};
const SettingItem: React.FC<TypeProps> = ({ labelText, mode, children }) => {
  return (
    <>
      {mode === "model" && (
        <div className="w-full h-[40px] flex justify-between items-center rounded-xl border border-[#722ed1] p-3">
          <div className="text-[14px] truncate pr-2">{labelText}</div>
          <div className="text-[14px]">{children}</div>
        </div>
      )}

      {mode === "base" && (
        <div className="w-full h-auto flex flex-col justify-between items-start p-3 gap-2">
          <div className="text-[14px] font-bold">{labelText}</div>
          <div className="text-[14px]">{children}</div>
        </div>
      )}
    </>
  );
};
export default SettingItem;
