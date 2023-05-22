import React from "react";

import {
  Text as UpstreamText,
  StyleSheet,
  TextProps,
} from "@bacons/react-views";

import * as Font from "expo-font";

// const fontFamily = useFont('Inter_900Black');
// undefined | 'Inter_900Black' depending on loaded or not.
// <Text style={{ fontFamily }}>Hello</Text>

const fontLoadedListeners = new Map<string, Set<() => void>>();

export function loadAsync(
  fontFamilyOrFontMap: string | Record<string, Font.FontSource>,
  source?: Font.FontSource
) {
  return loadFontAsync(normalizeSource(fontFamilyOrFontMap, source));
}

export function useLoadFonts(
  fontFamilyOrFontMap: Record<string, Font.FontSource>
) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    loadFontAsync(fontFamilyOrFontMap).then(() => {
      if (!mounted) return;
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [fontFamilyOrFontMap]);

  return loaded;
}

function normalizeSource(
  fontFamilyOrFontMap: string | Record<string, Font.FontSource>,
  source?: Font.FontSource
): Record<string, Font.FontSource> {
  if (typeof fontFamilyOrFontMap === "string") {
    return {
      [fontFamilyOrFontMap]: source as Font.FontSource,
    };
  }
  return fontFamilyOrFontMap;
}

function loadFontAsync(sources: Record<string, Font.FontSource>) {
  return Promise.all(
    Object.entries(sources).map(([name, source]) => {
      Font.loadAsync(name, source).then(() => {
        // alert("loaded: " + name);
        const listeners = fontLoadedListeners.get(name);
        if (listeners) {
          for (const listener of listeners) {
            listener();
          }
        }
      });
    })
  );
}

export function useFont(name?: string): string | undefined {
  const [fontFamily, setFontFamily] = React.useState(
    // undefined
    name ? (Font.isLoaded(name) ? name : undefined) : undefined
  );
  React.useEffect(() => {
    if (!name || Font.isLoaded(name)) {
      return;
    }
    let mounted = true;
    if (!fontLoadedListeners.has(name)) {
      fontLoadedListeners.set(name, new Set());
    }
    const listeners = fontLoadedListeners.get(name);
    const listener = () => {
      if (!mounted) return;
      setFontFamily(name);
    };
    listeners.add(listener);
    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, [name]);

  return fontFamily;
}

type NProps = React.ComponentProps<typeof UpstreamText> & { block?: boolean };

export const Text = React.forwardRef<
  NProps,
  React.ElementRef<typeof UpstreamText>
>(({ block, ...props }, ref) => {
  const style = React.useMemo(
    () => StyleSheet.flatten(props.style),
    [props.style]
  );
  const fontFamily = useFont(style.fontFamily);

  const shouldBlock = React.useMemo(() => {
    return block && !fontFamily && style.fontFamily;
  }, [block, fontFamily, style.fontFamily]);

  const children = shouldBlock ? "" : props.children;

  return (
    <span
      ref={ref}
      {...props}
      children={children}
      style={[
        style,
        {
          // Ensure an unloaded font never reaches Yoga to prevent
          // a panic attack.
          fontFamily,
        },
      ]}
    />
  );
}) as React.FC<NProps>;
