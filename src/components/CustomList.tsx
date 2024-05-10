import * as Haptics from "expo-haptics";
import { Link, router } from "expo-router";
import React from "react";
import { Platform, SectionList, StyleSheet, Text, View } from "react-native";
import { ScrollView, TouchableHighlight } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import unstable_styles from "./custom-list.module.css";

import { Slate } from "@/constants/Colors";
import { SF } from "./sf-symbol";

function ActionTypeIcon({ type }: { type: "internal" | "external" }) {
  if (type === "internal") {
    return (
      <SF
        size={20}
        color={Slate[500]}
        name="chevron.forward"
        fallback="chevron-forward-outline"
      />
    );
  } else {
    return (
      <SF
        size={20}
        color={Slate[500]}
        name="arrow.up.right.square"
        fallback="open-outline"
      />
    );
    // return <Ionicons color={Slate[500]} size={20} name="open-outline" />;
  }
}

function Item({
  title,
  value,
  onPress,
  top,
  bottom,
  href,
  actionType,
  leftIcon,
}: {
  href?: string;
  title: string;
  value?: string;
  onPress?: () => void;
  top?: boolean;
  bottom?: boolean;
  leftIcon?: React.ReactNode;
  actionType?: "external" | "internal";
}) {
  const renderItem = () => {
    if (typeof value !== "undefined") {
      return <Text style={{ fontSize: 16, color: Slate[500] }}>{value}</Text>;
    } else if (onPress) {
      return <ActionTypeIcon type={actionType ?? "internal"} />;
    } else if (href) {
      if (href.startsWith("http")) {
        return <ActionTypeIcon type="external" />;
      } else {
        return <ActionTypeIcon type={actionType ?? "internal"} />;
      }
    }
  };

  const contents = (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        // fontSize: 18,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {leftIcon}
        {title && (
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              color: Slate[100],
              fontSize: 16,
            }}
          >
            {title}
          </Text>
        )}
      </View>
      {renderItem()}
    </View>
  );

  if (Platform.OS === "web") {
    if (href) {
      return (
        <Link
          target={href?.startsWith("http") ? "_blank" : undefined}
          href={href}
          className={unstable_styles.listItem}
          style={[
            {
              display: "flex",
              borderCurve: "continuous",
            },
            top && {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
            bottom && {
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            },
          ]}
        >
          {contents}
        </Link>
      );
    }
  }

  return (
    <TouchableHighlight
      disabled={!onPress && !href}
      style={[
        {
          borderCurve: "continuous",
          backgroundColor: Slate[800],
        },
        top && {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
        bottom && {
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        },
      ]}
      underlayColor={Slate[400]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (href) {
          router.push(href);
        }
        if (onPress) onPress();
      }}
    >
      {contents}
    </TouchableHighlight>
  );
}

export function LeftIconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        borderCurve: "continuous",
        borderRadius: 6,
        padding: 6,
        backgroundColor: Slate["100"],
      }}
    >
      {children}
    </View>
  );
}

export function CustomList(
  props: Omit<
    React.ComponentProps<typeof SectionList>,
    "renderItem" | "renderScrollComponent"
  >
) {
  const { bottom } = useSafeAreaInsets();

  return (
    <SectionList
      renderScrollComponent={(props) => <ScrollView {...props} />}
      initialNumToRender={30}
      contentContainerStyle={{
        paddingHorizontal: 20,
        // paddingVertical: 40,
        paddingBottom: bottom + 40,
      }}
      stickySectionHeadersEnabled={false}
      // SectionSeparatorComponent={CupertinoItemSeparatorComponent}
      renderSectionHeader={({ section: { title } }) => {
        if (title == null) {
          return null;
        }
        return (
          <View
            style={{
              justifyContent: "flex-end",
              paddingTop: 32,
              paddingBottom: 12,
              paddingLeft: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                textTransform: "uppercase",
                color: Slate[500],
                fontWeight: "bold",
                fontSize: 12,
                letterSpacing: 1.1,
              }}
            >
              {title}
            </Text>
          </View>
        );
      }}
      keyExtractor={(item) => item.title}
      renderItem={({ item, index, section }) => (
        <Item
          {...item}
          top={index === 0}
          bottom={index === section.data.length - 1}
        />
      )}
      {...props}
    />
  );
}

export function CupertinoItemSeparatorComponent() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Slate[100],
      }}
    >
      <View
        style={{
          marginLeft: ITEM_START_WIDTH,
          height: StyleSheet.hairlineWidth,
          backgroundColor: "#C6C6C8",
        }}
      />
    </View>
  );
}
const ITEM_START_WIDTH = 60;
