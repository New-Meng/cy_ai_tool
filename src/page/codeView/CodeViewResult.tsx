import { useEffect } from "react";
import { useAutoScrollBottom } from "../../hook";
import markDownStyles from "../../common/markdowmCss.module.css";
import { marked } from "marked";

export const CodeViewResult = ({ viewResult, streamStatus }: { viewResult: string; streamStatus: number }) => {
  const [scrollRef, autoScrollBottom] = useAutoScrollBottom();
  useEffect(() => {
    console.log(viewResult, "++??viewResult");
    autoScrollBottom();
  }, []);
  return (
    <>
      <div className="w-full h-full p-2 box-sizing">
        <div
          ref={scrollRef}
          className={`${streamStatus == 1 ? "is-generating" : ""} w-full bg-[#f5f5f5] rounded-2xl px-4 py-2 ${markDownStyles.markdown}`} // 添加气泡背景色、圆角和内边距，并应用 Markdown 样式
          dangerouslySetInnerHTML={{
            __html: marked.parse(viewResult) as string,
          }}
        ></div>
      </div>
    </>
  );
};
