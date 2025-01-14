import * as Haptics from "@/lib/expo-haptics";
import { Image, Text, useColorScheme, View } from "react-native";

import { icons, useDynamicAppIcon } from "./DynamicIconContext";
import TouchableBounce from "./TouchableBounce.native";

import { Slate } from "@/constants/Colors";
import { SF } from "./sf-symbol";

export default function App() {
  const [_icon, setIcon] = useDynamicAppIcon();
  const isDark = useColorScheme() === "dark";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Slate[900],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        {icons.map((icon, index) => {
          return (
            <Item
              onPress={() => {
                setIcon(icon.iconId);
              }}
              isSelected={icon.iconId === _icon}
              name={icon.name}
              source={isDark ? icon.sourceDark ?? icon.source : icon.source}
              key={String(index)}
            />
          );
        })}
      </View>
    </View>
  );
}

function Item({ ...props }) {
  return (
    <TouchableBounce
      onPressIn={() => Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Heavy)}
      onPress={() => {
        props.onPress();
        if (props.isSelected) {
          Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
        }
      }}
      style={{ marginVertical: 8, marginHorizontal: 24 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: props.isSelected ? 0.4 : 0.3,
          shadowRadius: 8.46,

          backgroundColor: props.isSelected ? Slate["200"] : Slate["800"],
          elevation: 9,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderRadius: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
            }}
          >
            <Image
              source={props.source}
              style={{
                width: 64,
                aspectRatio: 1,
                resizeMode: "cover",
                borderRadius: 16,
              }}
            />
            <Text
              style={{
                marginLeft: 20,
                fontSize: 18,
                fontFamily: "Inter_500Medium",
                color: props.isSelected ? Slate["800"] : Slate["200"],
              }}
            >
              {props.name}
            </Text>
          </View>
          {props.isSelected && (
            <SF
              style={{ marginRight: 8 }}
              name="checkmark"
              fallback="check"
              size={20}
              color={Slate["800"]}
            />
          )}
        </View>
      </View>
    </TouchableBounce>
  );
}
