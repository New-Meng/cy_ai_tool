import { useEffect, useRef } from "react";

/**
 * AI 打字光标跟随 Hook
 * 自动把闪烁点放到最后一个 <p> 末尾
 * @param isGenerating 是否正在生成中
 */
export function useAiTypingCursor(isGenerating: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!dotsRef.current) {
      const dots = document.createElement("span");
      dots.className = "custom-golbal-cursor-dot";
      dotsRef.current = dots;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const dots = dotsRef.current;

    if (!container || !dots) return;

    // 结束生成 → 隐藏光标
    if (!isGenerating) {
      if (dots.parentNode) {
        dots.remove();
      }
      return;
    }

    // 更新光标位置的函数
    const updateCursor = () => {
      // 找到最后一段元素（比如 <p>），如果没有子元素就放在 container 里
      const lastElement = container.lastElementChild || container;
      if (lastElement && lastElement !== dots) {
        lastElement.appendChild(dots);
      }
    };

    // 初始执行一次
    updateCursor();

    // 监听 DOM 变化（因为 dangerouslySetInnerHTML 会覆盖之前插入的光标节点）
    const observer = new MutationObserver((mutations) => {
      // 过滤掉我们自己插入光标触发的 DOM 变化，防止死循环
      const isSelfMutation = mutations.every(
        (m) => m.addedNodes.length === 1 && m.addedNodes[0] === dots
      );
      if (!isSelfMutation) {
        updateCursor();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [isGenerating]);

  return [containerRef];
}
