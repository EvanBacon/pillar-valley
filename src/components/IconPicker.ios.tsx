import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { Image, Text, View } from "react-native";
import AppIcon from "react-native-dynamic-app-icon";
import TouchableBounce from "react-native/Libraries/Components/Touchable/TouchableBounce";
import { Slate } from "@/src/constants/Colors";

function useIconName() {
  const [icon, _setIcon] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    AppIcon.getIconName((result) => {
      if (isMounted) _setIcon(result.iconName);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setIcon = React.useCallback(
    (icon) => {
      AppIcon.setAppIcon(icon);
      _setIcon(icon || null);
    },
    [_setIcon]
  );
  return [icon === "default" ? null : icon, setIcon];
}

const icons = [
  {
    name: "Auto",
    source: require("@/icons/pillars/default.png"),
    iconId: null,
  },
  {
    name: "Spring",
    source: require("@/icons/pillars/spring.png"),
    iconId: "spring",
  },
  {
    name: "Autumn",
    source: require("@/icons/pillars/autumn.png"),
    iconId: "autumn",
  },
  {
    name: "Solstice",
    source: require("@/icons/pillars/solstice.png"),
    iconId: "solstice",
  },
  {
    name: "Winter",
    source: require("@/icons/pillars/winter.png"),
    iconId: "winter",
  },
  {
    name: "Bacon",
    source: require("@/icons/pillars/special.png"),
    iconId: "special",
  },
];

export default function App() {
  const [_icon, setIcon] = useIconName();

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
              source={icon.source}
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
      onPress={props.onPress}
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
            <Entypo
              style={{ marginRight: 8 }}
              name="check"
              size={20}
              color={Slate["800"]}
            />
          )}
        </View>
      </View>
    </TouchableBounce>
  );
}
