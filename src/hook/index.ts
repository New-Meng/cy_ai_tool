import { useRef, useCallback } from "react";

export const useAutoScrollBottom = <T extends HTMLElement = HTMLDivElement>(
  time: number = 500,
) => {
  // 创建一个 ref 用于绑定到需要滚动的容器上
  const scrollRef = useRef<T>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef<number>(0);

  // 如果用户不上滑，则自动滚动到底部
  const autoScrollBottom = useCallback(() => {
    const divBox = scrollRef.current;
    if (timerRef.current) {
      return;
    } else {
      if (divBox) {
        timerRef.current = setTimeout(() => {
          divBox.scrollTop = divBox.scrollHeight;
          lastScrollTopRef.current = divBox.scrollTop;
          clearTimeout(timerRef.current as NodeJS.Timeout);
          timerRef.current = null;
        }, time);
      }
    }
  }, []);

  return [scrollRef, autoScrollBottom] as const;
};
