import WidgetKit
import SwiftUI

extension View {
  func widgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      return containerBackground(for: .widget) {
        ZStack {
          LinearGradient(
            gradient:
              Gradient(
                colors: [
                  Color("gradient1"),
                  Color("gradient2")
                ]
              ),
            startPoint: .top,
            endPoint: .bottom
          )
          Image("valleys")
            .resizable()
            .scaledToFill()
        }
      }
    } else {
      return background {
        ZStack {
          LinearGradient(
            gradient:
              Gradient(
                colors: [
                  Color("gradient1"),
                  Color("gradient2")
                ]
              ),
            startPoint: .top,
            endPoint: .bottom
          )
          .ignoresSafeArea()
          Image("valleys")
            .resizable()
            .scaledToFill()
            .ignoresSafeArea()
        }
      }
    }
  }
}

struct PillarWidgetView: View {
  let pillarsTraversed: Int
  
  @Environment(\.widgetFamily) var family
  
  @ViewBuilder
  var body: some View {
    switch family {
    case .systemSmall:
      ZStack {
        
        VStack() {
          Text("Valley Stats")
            .font(.title2)
            .foregroundColor(.white)
            .padding(.top, conditionalPadding)
          
          Spacer()
          
          Text("\(pillarsTraversed)")
            .font(.largeTitle)
            .foregroundColor(.white)
          
          Text("Pillars Traversed")
            .opacity(0.7)
            .multilineTextAlignment(.center)
            .foregroundColor(.white)
            .padding(.bottom, conditionalPadding)
        }
      }
      .widgetURL(URL(string: "/"))
      .widgetBackground()
    default:
      ZStack {}
    }
  }
  
  private var conditionalPadding: CGFloat {
        if #available(iOSApplicationExtension 17.0, *) {
            return 0
        } else {
            return 12
        }
    }
  
}

struct PillarProvider: TimelineProvider {
  
  func placeholder(in context: Context) -> PillarEntry {
    PillarEntry(date: Date(), pillarsTraversed: 0)
  }
  
  func getSnapshot(in context: Context, completion: @escaping (PillarEntry) -> Void) {
    let entry = PillarEntry(date: Date(), pillarsTraversed: 5)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<PillarEntry>) -> Void) {
    let userDefaults = UserDefaults(suiteName: "group.bacon.data")
    let pillars = userDefaults?.integer(forKey: "pillarsTraversed") ?? 0
    let entry = PillarEntry(date: Date(), pillarsTraversed: pillars)
    
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
}

struct PillarEntry: TimelineEntry {
  let date: Date
  let pillarsTraversed: Int
}

struct widgets: Widget {
  let kind: String = "PillarWidget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: PillarProvider()) { entry in
      PillarWidgetView(pillarsTraversed: entry.pillarsTraversed)
    }
    .configurationDisplayName("Pillar Widget")
    .description("Displays the number of pillars traversed.")
    
  }
}

struct widgets_Previews: PreviewProvider {
  static var previews: some View {
    PillarWidgetView(pillarsTraversed: 12) .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
