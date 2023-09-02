import WidgetKit
import SwiftUI

struct PillarWidgetView: View {
  let pillarsTraversed: Int
  
  var body: some View {
    ZStack {
      LinearGradient(gradient: Gradient(colors: [Color("gradient1"), Color("gradient2")]), startPoint: .top, endPoint: .bottom)
        .ignoresSafeArea()
     
      Image("valleys")
        // Fill absolutely with resize cover
        .resizable()
        .scaledToFill()
        .ignoresSafeArea()
        
      VStack() {
        Text("Valley Stats")
          .font(.title2)
          .padding(.top, 12)
          .foregroundColor(.white)
          
        Spacer()
       
        Text("\(pillarsTraversed)")
          .font(.largeTitle)
          .foregroundColor(.white)
        
     
        
        HStack {
          Text("Pillars Traversed")
            .opacity(0.7)
            .foregroundColor(.white)
            .padding(.bottom, 12)
        }
      }
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
    .supportedFamilies([.systemSmall])
    .configurationDisplayName("Pillar Widget")
    .description("Displays the number of pillars traversed.")
  }
}


struct widgets_Previews: PreviewProvider {
  static var previews: some View {
    PillarWidgetView(pillarsTraversed: 12) .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
