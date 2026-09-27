"""
Selective CMS Data Parity Sync — Production
Executes approved navigation + starter image FK changes atomically.
"""
import json
from django.db import transaction as db_transaction
from apps.navigation.models import NavigationMenu, NavigationItem
from apps.training.models import Program
from apps.media_library.models import MediaAsset

HEADER_MENU_ID = 1
FOOTER_MENU_ID = 3
MOBILE_MENU_ID = 2

SERVICES_CHILDREN = [
    {"label_en": "Web Development", "label_ar": "تطوير الويب", "url": "/services/web-development", "order": 1},
    {"label_en": "Mobile App Development", "label_ar": "تطوير تطبيقات الجوال", "url": "/services/mobile-app-development", "order": 2},
    {"label_en": "ERP & Business Systems", "label_ar": "أنظمة ERP وحلول الأعمال", "url": "/services/erp-business-systems", "order": 3},
    {"label_en": "AI & Automation", "label_ar": "الذكاء الاصطناعي والأتمتة", "url": "/services/ai-automation", "order": 4},
    {"label_en": "Custom Software", "label_ar": "برمجيات مخصصة", "url": "/services/custom-software-development", "order": 5},
    {"label_en": "Data & Analytics", "label_ar": "البيانات والتحليلات", "url": "/services/data-analytics", "order": 6},
    {"label_en": "System Integration", "label_ar": "تكامل الأنظمة", "url": "/services/system-integration", "order": 7},
]

TRAINING_CHILDREN = [
    {"label_en": "Professional Courses", "label_ar": "الكورسات الاحترافية", "url": "/training#professional-courses", "order": 1},
    {"label_en": "Starter Courses", "label_ar": "كورسات المبتدئين", "url": "/training/starter", "order": 2},
    {"label_en": "Summer Training", "label_ar": "التدريب الصيفي", "url": "/training/summer-training", "order": 3},
    {"label_en": "Offers", "label_ar": "العروض", "url": "/training/offers", "order": 4},
]

STARTER_IMAGE_MAP = [
    {"slug": "starter-python-programming", "media_asset_id": 23, "file": "optimized/basic-python.webp"},
    {"slug": "starter-frontend-development", "media_asset_id": 29, "file": "optimized/frontend-development.webp"},
    {"slug": "starter-data-analysis", "media_asset_id": 28, "file": "optimized/data-analysis.webp"},
    {"slug": "starter-flutter-development", "media_asset_id": 22, "file": "optimized/flutter-development.webp"},
    {"slug": "starter-icdl-digital-skills", "media_asset_id": 27, "file": "optimized/icdl.webp"},
]

result = {
    "modified": [],
    "created": [],
    "image_fks": [],
    "errors": [],
}

try:
    with db_transaction.atomic():
        # === HEADER MODIFICATIONS ===

        # Item 2: Services -> internal /services
        item2 = NavigationItem.objects.get(id=2, menu_id=HEADER_MENU_ID)
        old2 = {"link_type": item2.link_type, "url": item2.url, "anchor": item2.anchor}
        item2.link_type = "internal"
        item2.url = "/services"
        item2.anchor = ""
        item2.save()
        result["modified"].append({"id": 2, "menu": "header", "label": "Services", "old": old2, "new": {"link_type": "internal", "url": "/services", "anchor": ""}})

        # Item 3: Training -> promote to top-level (parent=NULL, order=3)
        item3 = NavigationItem.objects.get(id=3, menu_id=HEADER_MENU_ID)
        old3 = {"parent_id": item3.parent_id, "order": item3.order}
        item3.parent = None
        item3.order = 3
        item3.save()
        result["modified"].append({"id": 3, "menu": "header", "label": "Training", "old": old3, "new": {"parent_id": None, "order": 3}})

        # Item 4: Case Studies -> order=8 (under Services)
        item4 = NavigationItem.objects.get(id=4, menu_id=HEADER_MENU_ID)
        old4 = {"order": item4.order}
        item4.order = 8
        item4.save()
        result["modified"].append({"id": 4, "menu": "header", "label": "Case Studies", "old": old4, "new": {"order": 8}})

        # Item 6: Partners -> hide in header
        item6 = NavigationItem.objects.get(id=6, menu_id=HEADER_MENU_ID)
        old6 = {"is_visible": item6.is_visible}
        item6.is_visible = False
        item6.save()
        result["modified"].append({"id": 6, "menu": "header", "label": "Partners", "old": old6, "new": {"is_visible": False}})

        # Item 7: Insights -> internal /insights
        item7 = NavigationItem.objects.get(id=7, menu_id=HEADER_MENU_ID)
        old7 = {"link_type": item7.link_type, "url": item7.url}
        item7.link_type = "internal"
        item7.url = "/insights"
        item7.save()
        result["modified"].append({"id": 7, "menu": "header", "label": "Insights", "old": old7, "new": {"link_type": "internal", "url": "/insights"}})

        # Item 8: Careers -> hide in header
        item8 = NavigationItem.objects.get(id=8, menu_id=HEADER_MENU_ID)
        old8 = {"is_visible": item8.is_visible}
        item8.is_visible = False
        item8.save()
        result["modified"].append({"id": 8, "menu": "header", "label": "Careers", "old": old8, "new": {"is_visible": False}})

        # === HEADER: Create Services children ===
        for child in SERVICES_CHILDREN:
            existing = NavigationItem.objects.filter(
                menu_id=HEADER_MENU_ID,
                parent_id=2,
                label_en=child["label_en"],
                url=child["url"],
            ).first()
            if existing:
                result["created"].append({"label": child["label_en"], "url": child["url"], "parent": "Services", "status": "already_exists", "id": existing.id})
            else:
                ni = NavigationItem.objects.create(
                    menu_id=HEADER_MENU_ID,
                    parent_id=2,
                    label_en=child["label_en"],
                    label_ar=child["label_ar"],
                    link_type="internal",
                    url=child["url"],
                    order=child["order"],
                    is_visible=True,
                )
                result["created"].append({"label": child["label_en"], "url": child["url"], "parent": "Services", "status": "created", "id": ni.id})

        # === HEADER: Create Training children ===
        for child in TRAINING_CHILDREN:
            existing = NavigationItem.objects.filter(
                menu_id=HEADER_MENU_ID,
                parent_id=3,
                label_en=child["label_en"],
                url=child["url"],
            ).first()
            if existing:
                result["created"].append({"label": child["label_en"], "url": child["url"], "parent": "Training", "status": "already_exists", "id": existing.id})
            else:
                ni = NavigationItem.objects.create(
                    menu_id=HEADER_MENU_ID,
                    parent_id=3,
                    label_en=child["label_en"],
                    label_ar=child["label_ar"],
                    link_type="internal",
                    url=child["url"],
                    order=child["order"],
                    is_visible=True,
                )
                result["created"].append({"label": child["label_en"], "url": child["url"], "parent": "Training", "status": "created", "id": ni.id})

        # === FOOTER MODIFICATIONS ===

        # Item 14: Services -> internal /services
        item14 = NavigationItem.objects.get(id=14, menu_id=FOOTER_MENU_ID)
        old14 = {"link_type": item14.link_type, "url": item14.url, "anchor": item14.anchor}
        item14.link_type = "internal"
        item14.url = "/services"
        item14.anchor = "capabilities"
        item14.save()
        result["modified"].append({"id": 14, "menu": "footer", "label": "Services", "old": old14, "new": {"link_type": "internal", "url": "/services", "anchor": "capabilities"}})

        # Item 18: Careers -> hide in footer
        item18 = NavigationItem.objects.get(id=18, menu_id=FOOTER_MENU_ID)
        old18 = {"is_visible": item18.is_visible}
        item18.is_visible = False
        item18.save()
        result["modified"].append({"id": 18, "menu": "footer", "label": "Careers", "old": old18, "new": {"is_visible": False}})

        # === MOBILE MODIFICATIONS ===

        # Create Services item in mobile menu (order=2)
        existing_mobile_services = NavigationItem.objects.filter(
            menu_id=MOBILE_MENU_ID,
            label_en="Services",
            url="/services",
        ).first()
        if existing_mobile_services:
            result["created"].append({"label": "Services", "url": "/services", "parent": "mobile", "status": "already_exists", "id": existing_mobile_services.id})
        else:
            ni = NavigationItem.objects.create(
                menu_id=MOBILE_MENU_ID,
                label_en="Services",
                label_ar="الخدمات",
                link_type="internal",
                url="/services",
                order=2,
                is_visible=True,
            )
            result["created"].append({"label": "Services", "url": "/services", "parent": "mobile", "status": "created", "id": ni.id})

        # Reorder mobile items: Training=3, Case Studies=4, Contact=5
        item11 = NavigationItem.objects.get(id=11, menu_id=MOBILE_MENU_ID)
        old11 = {"order": item11.order}
        item11.order = 3
        item11.save()
        result["modified"].append({"id": 11, "menu": "mobile", "label": "Training", "old": old11, "new": {"order": 3}})

        item12 = NavigationItem.objects.get(id=12, menu_id=MOBILE_MENU_ID)
        old12 = {"order": item12.order}
        item12.order = 4
        item12.save()
        result["modified"].append({"id": 12, "menu": "mobile", "label": "Case Studies", "old": old12, "new": {"order": 4}})

        item13 = NavigationItem.objects.get(id=13, menu_id=MOBILE_MENU_ID)
        old13 = {"order": item13.order}
        item13.order = 5
        item13.save()
        result["modified"].append({"id": 13, "menu": "mobile", "label": "Contact", "old": old13, "new": {"order": 5}})

        # === STARTER COURSE IMAGE FK UPDATES ===
        for entry in STARTER_IMAGE_MAP:
            program = Program.objects.get(slug=entry["slug"])
            ma = MediaAsset.objects.get(id=entry["media_asset_id"])
            # Verify file exists
            if not ma.file or entry["file"] not in ma.file.name:
                raise ValueError(f"MediaAsset {entry['media_asset_id']} file mismatch: expected {entry['file']}, got {ma.file.name}")
            old_image_id = program.image_id
            program.image = ma
            program.save(update_fields=["image"])
            result["image_fks"].append({
                "slug": entry["slug"],
                "program_id": program.id,
                "old_image_id": old_image_id,
                "new_image_id": ma.id,
                "media_file": ma.file.name,
            })

    print("SUCCESS: All changes committed atomically")
    print(json.dumps(result, indent=2, ensure_ascii=False))

except Exception as e:
    print(f"FAILED: {e}")
    print("Transaction rolled back automatically. No changes were made.")
    import traceback
    traceback.print_exc()
