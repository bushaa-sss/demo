import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Video, AVPlaybackSource, ResizeMode } from "expo-av";

/* -----------------------------------------------------
   TYPES
----------------------------------------------------- */
type SectionKey =
  | "hero"
  | "services"
  | "process"
  | "work"
  | "testimonials"
  | "contact";

type PortfolioCategory = "all" | "web" | "mobile" | "ecommerce";

interface PortfolioItem {
  id: number;
  title: string;
  type: string;
  category: PortfolioCategory;
  description: string;
  metrics: string[];
  img: string;
}

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  source: AVPlaybackSource;
}

/* -----------------------------------------------------
   COLORS / THEME
----------------------------------------------------- */
const COLORS = {
  bg: "#050806",
  bgSoft: "#070e08",
  card: "#0c1610",
  cardSoft: "#101c13",
  border: "#273324",
  neon: "#C3FF3B",
  neonSoft: "#99E637",
  text: "#F5F8EC",
  textMuted: "#9FAE93",
  subtle: "#7A8A6D",
};

/* -----------------------------------------------------
   HERO SLIDES
----------------------------------------------------- */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "your-video",
    title: "We craft software that feels premium and performs under pressure.",
    subtitle:
      "From concept to launch, CraftTech partners with US businesses to design and build modern digital products.",
    source: require("./assets/herovideo1.mp4"),
  },
  {
    id: "matrix-ai",
    title: "Type-safe, AI-ready architectures built for the next decade.",
    subtitle:
      "We use modern TypeScript, cloud, and data practices to future-proof your platforms.",
    source: require("./assets/hero2.mp4"),
  },
  {
    id: "crafttech-brand",
    title: "Your product squad — strategy, design, and engineering in one team.",
    subtitle:
      "A distributed studio from Pakistan building for North American founders, product leaders, and CTOs.",
    source: require("./assets/hero3.webm"),
  },
];

/* -----------------------------------------------------
   HERO COPY MAPPING
----------------------------------------------------- */
const HERO_COPY: Record<
  string,
  { kicker: string; title: string; body: string }
> = {
  "your-video": {
    kicker: "Digital Product Studio",
    title:
      "We craft software that feels premium\nand performs under pressure.",
    body: "From concept to launch, CraftTech partners with US businesses to design and build modern digital products.",
  },
  "matrix-ai": {
    kicker: "Digital Product Studio",
    title: "Type-safe, AI-ready architectures\nbuilt for the next decade.",
    body: "We use modern TypeScript, cloud, and data practices to future-proof your platforms.",
  },
  "crafttech-brand": {
    kicker: "Digital Product Studio",
    title:
      "Your product squad — strategy, design,\nand engineering in one team.",
    body: "A distributed studio from Pakistan building for North American founders, product leaders, and CTOs.",
  },
};

/* -----------------------------------------------------
   PORTFOLIO ITEMS
----------------------------------------------------- */
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: "Fintech SaaS Dashboard",
    type: "Web App",
    category: "web",
    description:
      "Analytics-heavy admin experience with secure multi-tenant access and real-time KPIs.",
    metrics: ["+38% retention", "SOC2-ready"],
    img: "https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg",
  },
  {
    id: 2,
    title: "Telehealth Mobile Platform",
    type: "Mobile App",
    category: "mobile",
    description:
      "Virtual care, scheduling, and secure messaging for a US-based healthcare startup.",
    metrics: ["iOS & Android", "50k+ sessions"],
    img: "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg",
  },
  {
    id: 3,
    title: "Headless Commerce Experience",
    type: "E-Commerce",
    category: "ecommerce",
    description:
      "Conversion-optimized storefront with a custom product configurator and fast checkout.",
    metrics: ["3.9x ROI", "<1s page loads"],
    img: "https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg",
  },
];

/* -----------------------------------------------------
   TESTIMONIALS
----------------------------------------------------- */
const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "CraftTech helped us ship a product our customers actually love to use. Fast, focused, and reliable.",
    name: "Jordan Miles",
    role: "VP Product, Fintech",
  },
  {
    id: 2,
    quote:
      "They understand both UX and engineering. The collaboration felt like having an internal product squad.",
    name: "Emily Carter",
    role: "Founder, HealthTech",
  },
  {
    id: 3,
    quote:
      "Clear communication, great quality, and they handled complex requirements without drama.",
    name: "Daniel Ortiz",
    role: "CTO, Retail Brand",
  },
];

/* -----------------------------------------------------
   APP COMPONENT
----------------------------------------------------- */
const App: React.FC = () => {
  const scrollRef = useRef<ScrollView | null>(null);
  const videoRef = useRef<Video | null>(null);
  const { width } = useWindowDimensions();

  const isMobile = width <= 600;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  // STATE
  const [sectionPositions, setSectionPositions] =
    useState<Partial<Record<SectionKey, number>>>({});
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [portfolioFilter, setPortfolioFilter] =
    useState<PortfolioCategory>("all");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });

  // ANIMATIONS
  const heroAnim = useRef(new Animated.Value(0)).current;

  const [servicesAnimated, setServicesAnimated] = useState(false);
  const servicesTitleAnim = useRef(new Animated.Value(0)).current;
  const serviceCard1Anim = useRef(new Animated.Value(0)).current;
  const serviceCard2Anim = useRef(new Animated.Value(0)).current;
  const serviceCard3Anim = useRef(new Animated.Value(0)).current;

  const [processAnimated, setProcessAnimated] = useState(false);
  const processStep1Anim = useRef(new Animated.Value(0)).current;
  const processStep2Anim = useRef(new Animated.Value(0)).current;
  const processStep3Anim = useRef(new Animated.Value(0)).current;
  const processStep4Anim = useRef(new Animated.Value(0)).current;

  const [workAnimated, setWorkAnimated] = useState(false);
  const workCard1Anim = useRef(new Animated.Value(0)).current;
  const workCard2Anim = useRef(new Animated.Value(0)).current;
  const workCard3Anim = useRef(new Animated.Value(0)).current;

  const [testimonialsAnimated, setTestimonialsAnimated] = useState(false);
  const testimonial1Anim = useRef(new Animated.Value(0)).current;
  const testimonial2Anim = useRef(new Animated.Value(0)).current;
  const testimonial3Anim = useRef(new Animated.Value(0)).current;

  const footerAnim = useRef(new Animated.Value(0)).current;

  const currentSlide = HERO_SLIDES[activeSlideIndex];
  const heroCopy = HERO_COPY[currentSlide.id] ?? HERO_COPY["your-video"];

  /* -----------------------------------------------------
     HERO AUTOPLAY & ANIM
  ----------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 13000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    heroAnim.setValue(0);
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeSlideIndex, heroAnim]);

  /* -----------------------------------------------------
     ANIMATION TRIGGERS
  ----------------------------------------------------- */
  const triggerServicesAnimation = () => {
    if (servicesAnimated) return;
    setServicesAnimated(true);

    Animated.timing(servicesTitleAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Animated.stagger(150, [
        Animated.timing(serviceCard1Anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(serviceCard2Anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(serviceCard3Anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const triggerProcessAnimation = () => {
    if (processAnimated) return;
    setProcessAnimated(true);

    Animated.stagger(140, [
      Animated.timing(processStep1Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(processStep2Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(processStep3Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(processStep4Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerWorkAnimation = () => {
    if (workAnimated) return;
    setWorkAnimated(true);

    Animated.stagger(160, [
      Animated.timing(workCard1Anim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(workCard2Anim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(workCard3Anim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerTestimonialsAnimation = () => {
    if (testimonialsAnimated) return;
    setTestimonialsAnimated(true);

    Animated.stagger(140, [
      Animated.timing(testimonial1Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(testimonial2Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(testimonial3Anim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* -----------------------------------------------------
     SCROLL HANDLER
  ----------------------------------------------------- */
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setScrolled(y > 40);

    if (!servicesAnimated && sectionPositions.services != null && y + 300 >= sectionPositions.services) {
      triggerServicesAnimation();
    }

    if (!processAnimated && sectionPositions.process != null && y + 300 >= sectionPositions.process) {
      triggerProcessAnimation();
    }

    if (!workAnimated && sectionPositions.work != null && y + 300 >= sectionPositions.work) {
      triggerWorkAnimation();
    }

    if (!testimonialsAnimated && sectionPositions.testimonials != null && y + 300 >= sectionPositions.testimonials) {
      // trigger testimonials + footer fade-in together
      triggerTestimonialsAnimation();
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSectionLayout =
    (key: SectionKey) =>
    (event: LayoutChangeEvent) => {
      const { y } = event.nativeEvent.layout;
      setSectionPositions((prev) => ({ ...prev, [key]: y }));
    };

  const scrollToSection = (key: SectionKey) => {
    const y = sectionPositions[key] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setNavOpen(false);
  };

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.email || !form.message) {
      Alert.alert("Missing info", "Please add at least your email and idea.");
      return;
    }
    Alert.alert("Brief sent", "We’ll reply within one business day.");
    setForm({
      name: "",
      email: "",
      company: "",
      budget: "",
      message: "",
    });
  };

  const filteredPortfolio =
    portfolioFilter === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((i) => i.category === portfolioFilter);

  /* -----------------------------------------------------
     NAV ITEMS
  ----------------------------------------------------- */
  const centerNavItems = [
    {
      key: "services",
      label: "Services",
      section: "services" as SectionKey,
      children: [
        { label: "Web App Development", section: "services" as SectionKey },
        { label: "Mobile App Development", section: "services" as SectionKey },
        { label: "UI/UX & Product Design", section: "services" as SectionKey },
        {
          label: "Cloud & Backend Engineering",
          section: "services" as SectionKey,
        },
      ],
    },
    {
      key: "industries",
      label: "Industries",
      section: "work" as SectionKey,
      children: [
        { label: "Fintech & Banking", section: "work" as SectionKey },
        { label: "Healthcare & Telehealth", section: "work" as SectionKey },
        { label: "Retail & E-Commerce", section: "work" as SectionKey },
        { label: "Startups & SaaS", section: "work" as SectionKey },
      ],
    },
    {
      key: "insights",
      label: "Insights",
      section: "process" as SectionKey,
      children: [
        { label: "Delivery Playbook", section: "process" as SectionKey },
        { label: "Design Systems", section: "services" as SectionKey },
        { label: "Scalable Architectures", section: "process" as SectionKey },
      ],
    },
    {
      key: "about",
      label: "About",
      section: "testimonials" as SectionKey,
      children: [
        { label: "Our Team", section: "testimonials" as SectionKey },
        { label: "How We Work", section: "process" as SectionKey },
        { label: "Engagement Models", section: "contact" as SectionKey },
      ],
    },
  ];

  const mobileNavItems: { label: string; section: SectionKey }[] = [
    { label: "Services", section: "services" },
    { label: "Process", section: "process" },
    { label: "Work", section: "work" },
    { label: "Clients", section: "testimonials" },
    { label: "Contact", section: "contact" },
  ];

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) =>
      prev === 0 ? HERO_SLIDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          scrolled && styles.headerScrolled,
          { paddingHorizontal: isTablet ? 32 : 20 },
        ]}
      >
        {/* Left: logo */}
        <TouchableOpacity
          style={styles.logoRow}
          activeOpacity={0.8}
          onPress={() => scrollToSection("hero")}
        >
          <Image
            source={require("./assets/crafttech-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoTitle}>CraftTech</Text>
            <Text style={styles.logoSubtitle}>Digital Product Studio</Text>
          </View>
        </TouchableOpacity>

        {/* Center nav (tablet/desktop) */}
        {isTablet && (
          <View style={styles.navCenterRow}>
            {centerNavItems.map((item) => (
              <View
                key={item.key}
                style={styles.navCenterItem}
                // @ts-ignore - web hover only
                onMouseEnter={() => setOpenDropdown(item.key)}
                // @ts-ignore
                onMouseLeave={() =>
                  setOpenDropdown((prev) => (prev === item.key ? null : prev))
                }
              >
                <TouchableOpacity
                  onPress={() => scrollToSection(item.section)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navCenterLabel}>{item.label}</Text>
                </TouchableOpacity>

                {openDropdown === item.key && (
                  <View style={styles.dropdownMenu}>
                    {item.children.map((child) => (
                      <TouchableOpacity
                        key={child.label}
                        style={styles.dropdownItem}
                        onPress={() => {
                          scrollToSection(child.section);
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={styles.dropdownText}>{child.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Right side CTA / Burger */}
        {isTablet ? (
          <TouchableOpacity
            style={styles.navCta}
            onPress={() => scrollToSection("contact")}
          >
            <Text style={styles.navCtaText}>Book a call</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.burger}
            onPress={() => setNavOpen((prev) => !prev)}
          >
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile nav */}
      {!isTablet && navOpen && (
        <View style={styles.mobileNav}>
          {mobileNavItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.mobileNavItem}
              onPress={() => scrollToSection(item.section)}
            >
              <Text style={styles.mobileNavText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.navCta, { marginTop: 8 }]}
            onPress={() => scrollToSection("contact")}
          >
            <Text style={styles.navCtaText}>Book a call</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isTablet ? 32 : 20 },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* HERO with VIDEO CAROUSEL */}
        <View onLayout={handleSectionLayout("hero")} style={styles.hero}>
          <Video
            ref={(ref) => {
              videoRef.current = ref;
            }}
            key={currentSlide.id}
            source={currentSlide.source}
            style={styles.heroVideo}
            shouldPlay
            isMuted
            isLooping
            resizeMode={ResizeMode.COVER}
          />

          <View style={styles.heroOverlay} />

          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity: heroAnim,
                transform: [
                  {
                    translateY: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.heroKicker}>{heroCopy.kicker}</Text>

            <Text
              style={[
                styles.heroTitle,
                { fontSize: isDesktop ? 48 : isTablet ? 38 : 32 },
              ]}
            >
              {heroCopy.title}
            </Text>

            <Text style={styles.heroSubtitle}>{heroCopy.body}</Text>

            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.heroPrimaryCta}
                onPress={() => scrollToSection("contact")}
              >
                <Text style={styles.heroPrimaryText}>Get in touch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroSecondaryCta}
                onPress={() => scrollToSection("services")}
              >
                <Text style={styles.heroSecondaryText}>View services</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Arrows */}
          <TouchableOpacity
            style={[styles.heroArrow, styles.heroArrowLeft]}
            onPress={handlePrevSlide}
          >
            <Text style={styles.heroArrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroArrow, styles.heroArrowRight]}
            onPress={handleNextSlide}
          >
            <Text style={styles.heroArrowText}>›</Text>
          </TouchableOpacity>

          {/* Dots */}
          <View style={styles.heroDotsRow}>
            {HERO_SLIDES.map((slide, index) => {
              const active = index === activeSlideIndex;
              return (
                <View
                  key={slide.id}
                  style={[styles.heroDot, active && styles.heroDotActive]}
                />
              );
            })}
          </View>
        </View>

        {/* SERVICES */}
        <View onLayout={handleSectionLayout("services")} style={styles.section}>
          <View
            style={[
              styles.servicesRow,
              { flexDirection: isTablet ? "row" : "column" },
            ]}
          >
            {/* LEFT — intro */}
            <Animated.View
              style={[
                styles.servicesIntro,
                isTablet ? { marginRight: 32 } : { marginBottom: 24 },
                {
                  opacity: servicesTitleAnim,
                  transform: [
                    {
                      translateX: servicesTitleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-60, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sectionLabel}>Services</Text>
              <Text style={styles.sectionTitle}>End-to-end product delivery</Text>
              <Text style={styles.sectionSubtitle}>
                Strategy, design, and engineering for teams that ship serious
                software. We work with the same stacks your in-house engineers
                already love.
              </Text>

              {/* Tech icons */}
              <View style={styles.techIconRow}>
                <Animated.View
                  style={[
                    styles.techIcon,
                    {
                      opacity: servicesTitleAnim,
                      transform: [
                        {
                          translateY: servicesTitleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.techIconText, { color: "#61DAFB" }]}>
                    React
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.techIcon,
                    {
                      opacity: servicesTitleAnim,
                      transform: [
                        {
                          translateY: servicesTitleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.techIconText, { color: "#68A063" }]}>
                    Node.js
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.techIcon,
                    {
                      opacity: servicesTitleAnim,
                      transform: [
                        {
                          translateY: servicesTitleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [16, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.techIconText, { color: "#3178C6" }]}>
                    TypeScript
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.techIcon,
                    {
                      opacity: servicesTitleAnim,
                      transform: [
                        {
                          translateY: servicesTitleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [18, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.techIconText, { color: "#FF9900" }]}>
                    AWS
                  </Text>
                </Animated.View>
              </View>
            </Animated.View>

            {/* RIGHT — cards */}
            <View style={styles.servicesCardsWrapper}>
              {/* Card 1 */}
              <Animated.View
                style={[
                  styles.serviceCard,
                  {
                    opacity: serviceCard1Anim,
                    transform: [
                      {
                        translateY: serviceCard1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: serviceCard1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.serviceLabel}>01</Text>
                  <Text style={styles.cardTitle}>Product Strategy & Discovery</Text>
                </View>
                <Text style={styles.cardBody}>
                  We help you validate ideas, prioritise features, and align
                  stakeholders before a single line of code is written.
                </Text>

                <View style={styles.techRow}>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>MVP Roadmaps</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Discovery Workshops</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Product Analytics</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>View case study →</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Card 2 */}
              <Animated.View
                style={[
                  styles.serviceCard,
                  {
                    opacity: serviceCard2Anim,
                    transform: [
                      {
                        translateY: serviceCard2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: serviceCard2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.serviceLabel}>02</Text>
                  <Text style={styles.cardTitle}>Design & Experience</Text>
                </View>
                <Text style={styles.cardBody}>
                  Premium product UX for web and mobile — clean, modern, and
                  optimised for real-world usage, not just Dribbble shots.
                </Text>

                <View style={styles.techRow}>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Figma</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Design Systems</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Prototypes</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>View case study →</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Card 3 */}
              <Animated.View
                style={[
                  styles.serviceCard,
                  {
                    opacity: serviceCard3Anim,
                    transform: [
                      {
                        translateY: serviceCard3Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: serviceCard3Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.serviceLabel}>03</Text>
                  <Text style={styles.cardTitle}>Engineering & Launch</Text>
                </View>
                <Text style={styles.cardBody}>
                  TypeScript-first builds on React, React Native, Node.js, and
                  AWS — with performance, reliability, and handover in mind.
                </Text>

                <View style={styles.techRow}>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>React</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>Node.js</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>TypeScript</Text>
                  </View>
                  <View style={styles.techPill}>
                    <Text style={styles.techPillText}>AWS</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>View case study →</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* PROCESS */}
        <View onLayout={handleSectionLayout("process")} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Process</Text>
            <Text style={styles.sectionTitle}>
              How we take you from brief to launch
            </Text>
            <Text style={styles.sectionSubtitle}>
              A simple, transparent flow that keeps founders, PMs, and CTOs in
              sync while we build.
            </Text>
          </View>

          <View style={styles.processRail}>
            <Animated.View
              style={[
                styles.processStepCard,
                {
                  opacity: processStep1Anim,
                  transform: [
                    {
                      translateY: processStep1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                    {
                      scale: processStep1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.processStep}>01 • Discover</Text>
              <Text style={styles.cardBody}>
                Workshops, research, and requirements to get everyone aligned on
                the same problem and outcome.
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.processStepCard,
                {
                  opacity: processStep2Anim,
                  transform: [
                    {
                      translateY: processStep2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                    {
                      scale: processStep2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.processStep}>02 • Design</Text>
              <Text style={styles.cardBody}>
                Flows, wireframes, and polished UI that reflect your brand and
                real user journeys.
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.processStepCard,
                {
                  opacity: processStep3Anim,
                  transform: [
                    {
                      translateY: processStep3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                    {
                      scale: processStep3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.processStep}>03 • Build</Text>
              <Text style={styles.cardBody}>
                Sprints with demos, reviews, and code that your in-house team
                can extend with confidence.
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.processStepCard,
                {
                  opacity: processStep4Anim,
                  transform: [
                    {
                      translateY: processStep4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                    {
                      scale: processStep4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.processStep}>04 • Launch & grow</Text>
              <Text style={styles.cardBody}>
                Rollout, monitoring, and iterative improvements based on real
                usage and product metrics.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* WORK */}
        <View onLayout={handleSectionLayout("work")} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Work</Text>
            <Text style={styles.sectionTitle}>
              Products we’ve shipped with teams like yours
            </Text>
            <Text style={styles.sectionSubtitle}>
              A snapshot of the platforms we design and build for US startups,
              scaleups, and enterprises.
            </Text>
          </View>

          <View style={styles.filterRow}>
            {(["all", "web", "mobile", "ecommerce"] as PortfolioCategory[]).map(
              (cat) => {
                const LABELS: Record<PortfolioCategory, string> = {
                  all: "All",
                  web: "Web",
                  mobile: "Mobile",
                  ecommerce: "E-commerce",
                };
                const active = portfolioFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      active && styles.filterChipActive,
                    ]}
                    onPress={() => setPortfolioFilter(cat)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <View style={styles.workGrid}>
            {filteredPortfolio.map((item, index) => {
              const anim =
                index === 0
                  ? workCard1Anim
                  : index === 1
                  ? workCard2Anim
                  : workCard3Anim;

              const animatedStyle = {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 + index * 8, 0],
                    }),
                  },
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              };

              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.portfolioCard,
                    isTablet && styles.portfolioCardHalf,
                    animatedStyle,
                  ]}
                >
                  <View style={styles.portfolioImageWrapper}>
                    <Image
                      source={{ uri: item.img }}
                      style={styles.portfolioImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.portfolioContent}>
                    <Text style={styles.portfolioType}>{item.type}</Text>
                    <Text style={styles.portfolioTitle}>{item.title}</Text>
                    <Text style={styles.portfolioBody}>
                      {item.description}
                    </Text>

                    <View style={styles.portfolioMetricsRow}>
                      {item.metrics.map((metric) => (
                        <View key={metric} style={styles.metricPill}>
                          <Text style={styles.metricPillText}>{metric}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* TESTIMONIALS */}
        <View
          onLayout={handleSectionLayout("testimonials")}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Clients</Text>
            <Text style={styles.sectionTitle}>What partners say</Text>
            <Text style={styles.sectionSubtitle}>
              Real feedback from founders, PMs, and CTOs we’ve partnered with
              across the US.
            </Text>
          </View>

          <View
            style={[
              styles.testimonialGrid,
              { flexDirection: isTablet ? "row" : "column" },
            ]}
          >
            {TESTIMONIALS.map((t, index) => {
              const animList = [
                testimonial1Anim,
                testimonial2Anim,
                testimonial3Anim,
              ];
              const anim = animList[index];

              return (
                <Animated.View
                  key={t.id}
                  style={[
                    styles.testimonialCard,
                    {
                      opacity: anim,
                      transform: [
                        {
                          translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [35 + index * 8, 0],
                          }),
                        },
                        {
                          scale: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.94, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.quoteMark}>“</Text>
                  <Text style={styles.testimonialText}>{t.quote}</Text>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialRole}>{t.role}</Text>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* CONTACT */}
        <View
          onLayout={handleSectionLayout("contact")}
          style={[styles.section, { paddingBottom: 60 }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Contact</Text>
            <Text style={styles.sectionTitle}>Tell us what you’re building</Text>
            <Text style={styles.sectionSubtitle}>
              Share a quick summary of your product, your team, and your
              timeline. We’ll respond with a short Loom and suggested next
              steps.
            </Text>
          </View>

          <View
            style={[
              styles.contactRow,
              { flexDirection: isDesktop ? "row" : "column" },
            ]}
          >
            {/* Form */}
            <View style={styles.contactForm}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={COLORS.subtle}
                value={form.name}
                onChangeText={(v) => handleFormChange("name", v)}
              />

              <Text style={styles.inputLabel}>Work email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@company.com"
                placeholderTextColor={COLORS.subtle}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => handleFormChange("email", v)}
              />

              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                placeholder="Company or startup name"
                placeholderTextColor={COLORS.subtle}
                value={form.company}
                onChangeText={(v) => handleFormChange("company", v)}
              />

              <Text style={styles.inputLabel}>Rough budget (USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 20k – 60k"
                placeholderTextColor={COLORS.subtle}
                value={form.budget}
                onChangeText={(v) => handleFormChange("budget", v)}
              />

              <Text style={styles.inputLabel}>
                What are you looking to build?
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="App, platform, redesign, MVP…"
                placeholderTextColor={COLORS.subtle}
                multiline
                numberOfLines={4}
                value={form.message}
                onChangeText={(v) => handleFormChange("message", v)}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Send brief</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoTitle}>
                Based in Pakistan, building for the US.
              </Text>
              <Text style={styles.contactInfoBody}>
                We’re a distributed product squad working with founders, product
                leaders, and CTOs across North America. Expect clear async
                communication and real momentum.
              </Text>

              <View style={styles.contactInfoBox}>
                <Text style={styles.contactInfoLabel}>Engagements</Text>
                <Text style={styles.contactInfoBody}>
                  • 8–16 week product sprints{"\n"}
                  • Dedicated PM, design, and engineering{"\n"}
                  • Slack, Notion, and Loom-native collaboration
                </Text>
              </View>

              <View style={styles.contactInfoBox}>
                <Text style={styles.contactInfoLabel}>Contact</Text>
                <Text style={styles.contactInfoBody}>
                  hello@crafttech.studio{"\n"}Mon – Fri • US & PK friendly hours
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerAnim,
              transform: [
                {
                  translateY: footerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.footerTitle}>CraftTech</Text>

          <Text style={styles.footerTagline}>
            Building premium digital products for US startups, founders, and
            CTOs.
          </Text>

          <View style={styles.footerSocialRow}>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}></Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}></Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} CraftTech. All rights reserved.
          </Text>
          <Text style={styles.footerCopy}>
            Designed & built with TypeScript, React Native, and Expo Web.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

/* -----------------------------------------------------
   STYLES
----------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
    backgroundColor: "rgba(5,8,6,0.9)",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(60,80,50,0.4)",
  },
  headerScrolled: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  logoSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  navCenterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  navCenterItem: {
    position: "relative",
    marginHorizontal: 6,
  },
  navCenterLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  dropdownMenu: {
    position: "absolute",
    top: 28,
    left: -8,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 180,
    zIndex: 30,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  navCta: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.neon,
  },
  navCtaText: {
    color: "#051003",
    fontSize: 14,
    fontWeight: "600",
  },
  burger: {
    padding: 8,
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.text,
    marginVertical: 2,
    borderRadius: 999,
  },
  mobileNav: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    zIndex: 15,
    backgroundColor: COLORS.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  mobileNavItem: {
    paddingVertical: 8,
  },
  mobileNavText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 96,
    paddingBottom: 40,
  },

  // HERO
  hero: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 32,
  },
  heroVideo: {
    width: "100%",
    height: "100%",
    // @ts-ignore
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  heroKicker: {
    color: COLORS.neonSoft,
    fontSize: 12,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.text,
    fontWeight: "800",
    lineHeight: 42,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 540,
    marginBottom: 18,
  },
  heroCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  heroPrimaryCta: {
    backgroundColor: COLORS.neon,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  heroPrimaryText: {
    color: "#051003",
    fontSize: 14,
    fontWeight: "600",
  },
  heroSecondaryCta: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  heroSecondaryText: {
    color: COLORS.text,
    fontSize: 14,
  },
  heroArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroArrowLeft: {
    left: 14,
  },
  heroArrowRight: {
    right: 14,
  },
  heroArrowText: {
    color: COLORS.text,
    fontSize: 22,
  },
  heroDotsRow: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 3,
  },
  heroDotActive: {
    width: 18,
    backgroundColor: COLORS.neon,
  },

  // SECTIONS
  section: {
    paddingVertical: 42,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: COLORS.neonSoft,
    fontSize: 16,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  // SERVICES
  servicesRow: {
    alignItems: "stretch",
  },
  servicesIntro: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 420,
  },
  servicesCardsWrapper: {
    flex: 1,
  },
  serviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    minHeight: 95,
    justifyContent: "center",
  },
  serviceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  serviceLabel: {
    color: COLORS.neonSoft,
    fontSize: 10,
    fontWeight: "700",
    marginRight: 6,
  },

  // generic card
  cardGrid: {
    justifyContent: "space-between",
    gap: 26,
  },
  techIconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  techIcon: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  techIconText: {
    fontSize: 11,
    fontWeight: "600",
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 2,
  },
  techPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 4,
    backgroundColor: "#0b140e",
  },
  techPillText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  ghostButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(195,255,59,0.5)",
  },
  ghostButtonText: {
    color: COLORS.neonSoft,
    fontSize: 10.5,
    fontWeight: "600",
  },

  // PROCESS
  processRail: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  processStepCard: {
    flex: 1,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  processStep: {
    color: COLORS.neonSoft,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardBody: {
    color: COLORS.textMuted,
    fontSize: 11.5,
    lineHeight: 15,
    marginBottom: 4,
  },
  cardListTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  cardListItem: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  // FILTERS & WORK
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.neon,
    borderColor: COLORS.neon,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: "#051003",
    fontWeight: "600",
  },
  workGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  portfolioCard: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 18,
    marginHorizontal: 6,
    maxWidth: 420,
  },
  portfolioCardHalf: {
    width: "47%",
  },
  portfolioImageWrapper: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#020403",
  },
  portfolioImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
  },
  portfolioContent: {
    padding: 12,
  },
  portfolioType: {
    color: COLORS.neonSoft,
    fontSize: 11,
    marginBottom: 4,
  },
  portfolioTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  portfolioBody: {
    color: COLORS.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 8,
  },
  portfolioMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metricPill: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  metricPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },

  // TESTIMONIALS
  testimonialGrid: {
    justifyContent: "space-between",
    gap: 26,
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  quoteMark: {
    color: COLORS.neon,
    fontSize: 30,
    marginBottom: 6,
  },
  testimonialText: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  testimonialName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  testimonialRole: {
    color: COLORS.subtle,
    fontSize: 12.5,
  },

  // CONTACT
  contactRow: {
    justifyContent: "space-between",
    gap: 32,
    paddingRight: 12,
  },
  contactForm: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactInfoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  contactInfoBody: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  contactInfoBox: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  contactInfoLabel: {
    color: COLORS.neonSoft,
    fontSize: 12,
    marginBottom: 4,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSoft,
    color: COLORS.text,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: COLORS.neon,
    paddingVertical: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#051003",
    fontSize: 14,
    fontWeight: "600",
  },

  // FOOTER
  footer: {
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgSoft,
    borderRadius: 16,
    marginBottom: 20,
  },
  footerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  footerTagline: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 520,
    lineHeight: 18,
    marginBottom: 18,
  },
  footerSocialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  socialIconText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  footerDivider: {
    width: "90%",
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  footerCopy: {
    color: COLORS.subtle,
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 2,
  },
});
